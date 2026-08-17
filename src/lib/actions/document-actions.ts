"use server";

import { revalidatePath } from "next/cache";
import { requireStudent, requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { uploadDocument, reviewDocumentVersion, InvalidFileError } from "@/lib/services/document-service";

const DOCUMENT_PHASE_STATUSES = ["DOCUMENTS_REQUIRED", "DOCUMENT_REVIEW", "CORRECTION_REQUIRED"];

export async function uploadDocumentAction(applicationId: string, formData: FormData) {
  const { profile } = await requireStudent();
  const application = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  if (application.studentId !== profile.id) throw new Error("Not your application.");
  if (!DOCUMENT_PHASE_STATUSES.includes(application.status)) {
    throw new Error("Documents can't be uploaded at this stage of the application.");
  }

  const file = formData.get("file");
  const documentType = String(formData.get("documentType") ?? "");
  if (!(file instanceof File) || !documentType) {
    throw new Error("Please choose a file and a document type.");
  }

  try {
    await uploadDocument({ applicationId, studentId: profile.id, documentType, file });
  } catch (error) {
    if (error instanceof InvalidFileError) {
      throw new Error(error.message);
    }
    throw error;
  }
  revalidatePath(`/app/applications/${applicationId}`);
}

export async function reviewDocumentAction(
  applicationId: string,
  versionId: string,
  formData: FormData,
) {
  const user = await requireStaff();
  if (!hasPermission(user.role, "document.review")) throw new Error("Not permitted.");

  const decision = String(formData.get("decision")) as "APPROVED" | "REJECTED" | "CORRECTION_REQUIRED";
  const comment = String(formData.get("comment") ?? "").trim() || undefined;

  await reviewDocumentVersion({ versionId, reviewerId: user.id, decision, comment });
  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/applications");
}
