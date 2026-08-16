import { prisma } from "@/lib/prisma";
import type { CommissionTriggerEvent } from "@/lib/enums";

// Maps an application status transition to the commission trigger it
// satisfies (PRD §44-45). Not every status change fires a commission.
const STATUS_TO_TRIGGER: Partial<Record<string, CommissionTriggerEvent>> = {
  SUBMITTED: "APPLICATION_SUBMITTED",
  OFFER_ACCEPTED: "STUDENT_ADMITTED",
  ENROLLED: "STUDENT_ENROLLED",
};

function computeAmount(
  rule: { amountType: string; fixedAmount: number | null; percentage: number | null; percentageBasis: string | null },
  opportunity: { tuitionAmount: number | null; serviceFeeAmount: number | null },
): number {
  if (rule.amountType === "FIXED") return rule.fixedAmount ?? 0;
  const basisAmount = rule.percentageBasis === "SERVICE_FEE" ? opportunity.serviceFeeAmount : opportunity.tuitionAmount;
  if (!basisAmount || !rule.percentage) return 0;
  return Math.round((basisAmount * rule.percentage) / 100);
}

// Called after every application status change (PRD §44: "Commission may
// be triggered by ... application, ... admission, accepted offer,
// enrolment ... or another partner-defined event"). No-ops when the new
// status isn't a configured trigger, or no active rule matches.
export async function triggerCommissionsForStatus(applicationId: string, newStatus: string) {
  const triggerEvent = STATUS_TO_TRIGGER[newStatus];
  if (!triggerEvent) return;

  const application = await prisma.application.findUniqueOrThrow({
    where: { id: applicationId },
    include: {
      student: true,
      opportunity: { include: { programme: { include: { university: true } } } },
    },
  });

  const partnerId = application.opportunity.programme.university.partnerId;

  const rules = await prisma.commissionRule.findMany({
    where: {
      partnerId,
      active: true,
      triggerEvent,
      OR: [{ opportunityId: null }, { opportunityId: application.opportunityId }],
    },
  });

  for (const rule of rules) {
    const existing = await prisma.commission.findFirst({ where: { applicationId, ruleId: rule.id } });
    if (existing) continue; // idempotent — one commission per rule per application

    const amount = computeAmount(rule, application.opportunity);
    if (amount <= 0) continue;

    const agentShare = application.student.agentId
      ? Math.round((amount * rule.agentSharePercentage) / 100)
      : 0;

    const commission = await prisma.commission.create({
      data: {
        partnerId,
        ruleId: rule.id,
        studentId: application.studentId,
        applicationId,
        agentId: application.student.agentId,
        triggerEvent,
        amount,
        agentShare,
        currency: application.opportunity.tuitionCurrency ?? "NGN",
        status: "EXPECTED",
      },
    });

    await prisma.applicationEvent.create({
      data: {
        applicationId,
        type: "COMMISSION_CREATED",
        message: `Commission of ${(amount / 100).toLocaleString()} ${commission.currency} recorded (${triggerEvent}).`,
      },
    });
  }
}

export async function createCommissionRule(data: {
  partnerId: string;
  opportunityId?: string | null;
  triggerEvent: string;
  amountType: string;
  fixedAmount?: number | null;
  percentage?: number | null;
  percentageBasis?: string | null;
  agentSharePercentage: number;
}) {
  return prisma.commissionRule.create({ data });
}

export async function setCommissionRuleActive(id: string, active: boolean) {
  return prisma.commissionRule.update({ where: { id }, data: { active } });
}

export async function approveCommission(commissionId: string, approverId: string) {
  return prisma.commission.update({
    where: { id: commissionId },
    data: { status: "APPROVED", approvedAt: new Date(), approvedById: approverId },
  });
}

export async function rejectCommission(commissionId: string) {
  return prisma.commission.update({ where: { id: commissionId }, data: { status: "REJECTED" } });
}

export async function markCommissionPaid(commissionId: string) {
  return prisma.commission.update({
    where: { id: commissionId },
    data: { status: "PAID", paidAt: new Date() },
  });
}
