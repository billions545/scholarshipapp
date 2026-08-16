import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaffRole } from "@/lib/rbac";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireStudent() {
  const user = await requireUser();
  if (user.role !== "STUDENT") redirect("/admin");
  const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/login");
  return { user, profile };
}

export async function requireStaff() {
  const user = await requireUser();
  if (!isStaffRole(user.role)) redirect("/app/dashboard");
  return user;
}

export async function requireAgent() {
  const user = await requireUser();
  if (user.role !== "AGENT") redirect("/app/dashboard");
  return user;
}
