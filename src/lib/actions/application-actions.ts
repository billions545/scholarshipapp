"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStudent, requireStaff, getCurrentUser } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import * as applicationService from "@/lib/services/application-service";
import { AlreadyAppliedError } from "@/lib/services/application-service";
import type { ApplicationStatus } from "@/lib/enums";

export async function applyToOpportunityAction(opportunityId: string) {
  const { profile } = await requireStudent();
  try {
    const application = await applicationService.createApplication(profile.id, opportunityId);
    revalidatePath("/app/applications");
    redirect(`/app/applications/${application.id}`);
  } catch (error) {
    if (error instanceof AlreadyAppliedError) {
      redirect(`/app/applications/${error.applicationId}`);
    }
    throw error;
  }
}

async function assertCanAccessApplication(applicationId: string) {
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  return application;
}

export async function submitApplicationAction(applicationId: string) {
  const { user, profile } = await requireStudent();
  const application = await assertCanAccessApplication(applicationId);
  if (application.studentId !== profile.id) throw new Error("Not your application.");
  await applicationService.submitApplication(applicationId, user.id);
  revalidatePath(`/app/applications/${applicationId}`);
}

export async function staffSubmitApplicationAction(applicationId: string) {
  const user = await requireStaff();
  if (!hasPermission(user.role, "application.submit")) throw new Error("Not permitted.");
  await applicationService.submitApplication(applicationId, user.id);
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function transitionStatusAction(applicationId: string, formData: FormData) {
  const user = await requireStaff();
  if (!hasPermission(user.role, "application.update")) throw new Error("Not permitted.");
  const toStatus = String(formData.get("status")) as ApplicationStatus;
  const note = String(formData.get("note") ?? "").trim();
  await applicationService.transitionApplicationStatus(applicationId, toStatus, user.id, note || undefined);
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/applications");
}

export async function assignAdviserAction(applicationId: string, formData: FormData) {
  const user = await requireStaff();
  if (!hasPermission(user.role, "application.update")) throw new Error("Not permitted.");
  const adviserId = String(formData.get("adviserId") || "") || null;
  await applicationService.assignAdviser(applicationId, adviserId);
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function addInternalNoteAction(applicationId: string, formData: FormData) {
  const user = await requireStaff();
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;
  await applicationService.addNote({ applicationId, authorId: user.id, type: "INTERNAL_NOTE", content });
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function addStudentMessageAction(applicationId: string, formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  // Either the student or staff can post a message the other side can see.
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Not authenticated.");

  await applicationService.addNote({
    applicationId,
    authorId: currentUser.id,
    type: "STUDENT_MESSAGE",
    content,
  });
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath(`/app/applications/${applicationId}`);
}
