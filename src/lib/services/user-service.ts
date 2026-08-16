import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const registerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  countryOfResidence: z.string().max(100).optional(),
  password: z.string().min(8).max(200),
  referralCode: z.string().max(100).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export class EmailInUseError extends Error {
  constructor() {
    super("An account with this email already exists.");
  }
}

// Lightweight registration (PRD §14) — full profile is completed afterwards.
// Preserves referral attribution (PRD §68-69): first valid referring agent
// wins and is locked onto the profile at creation time.
export async function registerStudent(input: RegisterInput) {
  const normalizedEmail = input.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new EmailInUseError();

  const passwordHash = await bcrypt.hash(input.password, 12);

  let agent = null;
  if (input.referralCode) {
    agent = await prisma.user.findUnique({ where: { referralCode: input.referralCode } });
  }

  return prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: normalizedEmail,
      phone: input.phone,
      passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: {
          countryOfResidence: input.countryOfResidence,
          acquisitionSource: agent ? "AGENT" : input.referralCode ? "REFERRAL" : "WEBSITE",
          referralCode: input.referralCode ?? null,
          agentId: agent?.role === "AGENT" ? agent.id : null,
          referredAt: input.referralCode ? new Date() : null,
        },
      },
    },
  });
}
