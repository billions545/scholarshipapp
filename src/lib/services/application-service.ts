import { prisma } from "@/lib/prisma";
import { evaluateEligibility } from "@/lib/eligibility";
import { getStudentFacts } from "@/lib/services/student-service";
import { generateApplicationNumber, generateInvoiceNumber } from "@/lib/application-number";
import { deriveDocumentStatus, canTransition } from "@/lib/application-workflow";
import { labelize, type ApplicationStatus, type ApplicationEventType } from "@/lib/enums";
import { formatMoney } from "@/lib/money";
import { triggerCommissionsForStatus } from "@/lib/services/commission-service";

export class AlreadyAppliedError extends Error {
  constructor(public applicationId: string) {
    super("You already have an application for this opportunity.");
  }
}

export async function logEvent(
  applicationId: string,
  type: ApplicationEventType,
  message: string,
  opts?: { actorUserId?: string; metadata?: Record<string, unknown> },
) {
  return prisma.applicationEvent.create({
    data: {
      applicationId,
      type,
      message,
      actorUserId: opts?.actorUserId,
      metadata: opts?.metadata ? JSON.stringify(opts.metadata) : undefined,
    },
  });
}

// Creates an application from an opportunity (PRD §25), evaluates
// eligibility at creation time, and generates the document checklist tasks
// (PRD §27) from the opportunity's configured document requirements.
export async function createApplication(studentProfileId: string, opportunityId: string) {
  const existing = await prisma.application.findFirst({
    where: { studentId: studentProfileId, opportunityId, status: { notIn: ["WITHDRAWN", "CANCELLED"] } },
  });
  if (existing) throw new AlreadyAppliedError(existing.id);

  const opportunity = await prisma.opportunity.findUniqueOrThrow({
    where: { id: opportunityId },
    include: { documentRequirements: true, eligibilityRules: true },
  });

  const facts = await getStudentFacts(studentProfileId);
  const report = evaluateEligibility(opportunity.eligibilityRules, facts);

  const applicationNumber = await generateApplicationNumber();

  const application = await prisma.application.create({
    data: {
      applicationNumber,
      studentId: studentProfileId,
      opportunityId,
      status: "DOCUMENTS_REQUIRED",
      eligibilityResult: report.result,
      eligibilitySnapshot: JSON.stringify(report),
      tasks: {
        create: opportunity.documentRequirements.map((dr) => ({
          title: `Upload ${labelize(dr.documentType)}`,
          description: dr.conditional ? dr.conditionDescription ?? undefined : undefined,
          assigneeRole: "STUDENT",
          documentType: dr.documentType,
          priority: dr.required ? "HIGH" : "NORMAL",
        })),
      },
    },
  });

  await logEvent(application.id, "APPLICATION_CREATED", `Application ${applicationNumber} created.`);
  await logEvent(application.id, "ELIGIBILITY_COMPLETED", `Eligibility check completed: ${report.result}.`, {
    metadata: { result: report.result },
  });

  return application;
}

// Advances PAYMENT_REQUIRED -> PAYMENT_CONFIRMED -> READY_FOR_SUBMISSION once
// a payment succeeds. No-ops if the application has already moved on
// (keeps this safe to call from an idempotent webhook handler).
export async function advanceApplicationAfterPayment(applicationId: string) {
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  if (application.status !== "PAYMENT_REQUIRED") return;

  await prisma.application.update({ where: { id: applicationId }, data: { status: "PAYMENT_CONFIRMED" } });
  await logEvent(applicationId, "STATUS_CHANGED", "Status changed to PAYMENT_CONFIRMED.");

  await prisma.application.update({ where: { id: applicationId }, data: { status: "READY_FOR_SUBMISSION" } });
  await logEvent(applicationId, "STATUS_CHANGED", "Status changed to READY_FOR_SUBMISSION.");
}

// Recomputes the pre-submission status purely from the document checklist
// (PRD §119-120) and appends a timeline event if it changed.
export async function recomputeDocumentDrivenStatus(applicationId: string) {
  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: {
      opportunity: { include: { documentRequirements: true } },
      documents: { include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } } },
    },
  });

  const preSubmissionStatuses: ApplicationStatus[] = [
    "DRAFT",
    "DOCUMENTS_REQUIRED",
    "DOCUMENT_REVIEW",
    "CORRECTION_REQUIRED",
    "READY_FOR_SUBMISSION",
  ];
  if (!preSubmissionStatuses.includes(application.status as ApplicationStatus)) return application;

  const requiredTypes = application.opportunity.documentRequirements
    .filter((dr) => dr.required)
    .map((dr) => dr.documentType);

  const latestStatusByType = new Map<string, string>();
  for (const doc of application.documents) {
    const latest = doc.versions[0];
    if (latest && latest.status !== "SUPERSEDED") latestStatusByType.set(doc.documentType, latest.status);
  }

  const docStatus = deriveDocumentStatus(requiredTypes, latestStatusByType);
  const requiresPayment = !!application.opportunity.serviceFeeAmount && application.opportunity.serviceFeeAmount > 0;
  const nextStatus: ApplicationStatus =
    docStatus === "DOCUMENTS_APPROVED" ? (requiresPayment ? "PAYMENT_REQUIRED" : "READY_FOR_SUBMISSION") : docStatus;

  if (nextStatus !== application.status) {
    await prisma.application.update({ where: { id: applicationId }, data: { status: nextStatus } });
    await logEvent(applicationId, "STATUS_CHANGED", `Status changed to ${nextStatus}.`, {
      metadata: { from: application.status, to: nextStatus },
    });

    if (nextStatus === "PAYMENT_REQUIRED") {
      const invoiceNumber = await generateInvoiceNumber();
      await prisma.invoice.create({
        data: {
          invoiceNumber,
          studentId: application.studentId,
          applicationId: application.id,
          description: `Administration fee — ${application.opportunity.title}`,
          type: "ADMINISTRATION_FEE",
          amount: application.opportunity.serviceFeeAmount!,
          currency: application.opportunity.serviceFeeCurrency ?? "NGN",
          status: "UNPAID",
        },
      });
      await logEvent(
        applicationId,
        "STATUS_CHANGED",
        `Administration fee of ${formatMoney(application.opportunity.serviceFeeAmount, application.opportunity.serviceFeeCurrency)} is due.`,
      );
    }
  }
  return application;
}

export async function submitApplication(applicationId: string, actorUserId: string) {
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  if (application.status !== "READY_FOR_SUBMISSION") {
    throw new Error("Application is not ready for submission.");
  }
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
  await logEvent(applicationId, "SUBMITTED", "Application submitted.", { actorUserId });
  await triggerCommissionsForStatus(applicationId, "SUBMITTED");
}

export async function transitionApplicationStatus(
  applicationId: string,
  toStatus: ApplicationStatus,
  actorUserId: string,
  note?: string,
) {
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  if (!canTransition(application.status as ApplicationStatus, toStatus)) {
    throw new Error(`Cannot move application from ${application.status} to ${toStatus}.`);
  }
  await prisma.application.update({ where: { id: applicationId }, data: { status: toStatus } });
  await logEvent(applicationId, "STATUS_CHANGED", note || `Status changed to ${toStatus}.`, {
    actorUserId,
    metadata: { from: application.status, to: toStatus },
  });
  await triggerCommissionsForStatus(applicationId, toStatus);
}

export async function assignAdviser(applicationId: string, adviserId: string | null) {
  await prisma.application.update({ where: { id: applicationId }, data: { assignedAdviserId: adviserId } });
}

export async function addNote(data: {
  applicationId?: string;
  studentId?: string;
  authorId: string;
  type: "INTERNAL_NOTE" | "STUDENT_MESSAGE";
  content: string;
}) {
  const note = await prisma.note.create({ data });
  if (data.applicationId) {
    await logEvent(data.applicationId, "NOTE_ADDED", data.content.slice(0, 140), { actorUserId: data.authorId });
  }
  return note;
}
