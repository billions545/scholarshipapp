import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function randomSuffix(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function uniqueReferralCode(firstName: string): Promise<string> {
  const base = firstName.replace(/[^a-zA-Z]/g, "").toUpperCase() || "AGENT";
  let code = `${base}${randomSuffix()}`;
  while (await prisma.user.findUnique({ where: { referralCode: code } })) {
    code = `${base}${randomSuffix()}`;
  }
  return code;
}

export class EmailInUseError extends Error {
  constructor() {
    super("An account with this email already exists.");
  }
}

export async function createAgent(data: { firstName: string; lastName: string; email: string; password: string }) {
  const email = data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new EmailInUseError();

  const passwordHash = await bcrypt.hash(data.password, 12);
  const referralCode = await uniqueReferralCode(data.firstName);

  return prisma.user.create({
    data: {
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      role: "AGENT",
      referralCode,
      emailVerified: true,
    },
  });
}

export async function getAgentDashboardData(agentId: string) {
  const students = await prisma.studentProfile.findMany({
    where: { agentId },
    include: {
      user: true,
      applications: { include: { opportunity: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const applications = students.flatMap((s) => s.applications);
  const submitted = applications.filter((a) =>
    !["DRAFT", "PAYMENT_REQUIRED", "PAYMENT_CONFIRMED", "DOCUMENTS_REQUIRED", "DOCUMENT_REVIEW", "CORRECTION_REQUIRED", "READY_FOR_SUBMISSION"].includes(
      a.status,
    ),
  ).length;
  const accepted = applications.filter((a) =>
    ["OFFER_ACCEPTED", "ENROLMENT_PENDING", "ENROLLED"].includes(a.status),
  ).length;
  const enrolled = applications.filter((a) => a.status === "ENROLLED").length;

  const commissions = await prisma.commission.findMany({ where: { agentId } });
  const expectedCommission = commissions.reduce((sum, c) => sum + c.agentShare, 0);
  const paidCommission = commissions.filter((c) => c.status === "PAID").reduce((sum, c) => sum + c.agentShare, 0);

  return {
    students,
    stats: {
      studentCount: students.length,
      activeApplications: applications.filter((a) => !["ENROLLED", "REJECTED", "WITHDRAWN", "CANCELLED"].includes(a.status)).length,
      submitted,
      accepted,
      enrolled,
    },
    expectedCommission,
    paidCommission,
    commissions,
  };
}
