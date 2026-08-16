import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { validateUpload, getExtension } from "@/lib/file-validation";
import { recomputeDocumentDrivenStatus, logEvent } from "@/lib/services/application-service";
import { labelize } from "@/lib/enums";

// Local-disk stand-in for S3-compatible object storage (PRD §33, §87).
// Stored outside /public so nothing is served without going through the
// access-controlled download route.
const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

export class InvalidFileError extends Error {}

export async function uploadDocument(opts: {
  applicationId: string;
  studentId: string;
  documentType: string;
  file: File;
}) {
  const arrayBuffer = await opts.file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const validation = validateUpload(opts.file.name, opts.file.size, buffer);
  if (!validation.ok) throw new InvalidFileError(validation.error);

  const document = await prisma.document.upsert({
    where: { applicationId_documentType: { applicationId: opts.applicationId, documentType: opts.documentType } },
    update: {},
    create: { applicationId: opts.applicationId, studentId: opts.studentId, documentType: opts.documentType },
  });

  const versionCount = await prisma.documentVersion.count({ where: { documentId: document.id } });
  const versionNumber = versionCount + 1;

  // Supersede the previous current version so history is preserved (PRD §32).
  await prisma.documentVersion.updateMany({
    where: { documentId: document.id, status: { not: "SUPERSEDED" } },
    data: { status: "SUPERSEDED" },
  });

  const ext = getExtension(opts.file.name);
  const dir = path.join(STORAGE_ROOT, opts.applicationId, opts.documentType);
  await mkdir(dir, { recursive: true });
  const storedFileName = `v${versionNumber}-${randomUUID()}.${ext}`;
  const storagePath = path.join(dir, storedFileName);
  await writeFile(storagePath, buffer);

  const version = await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      versionNumber,
      fileName: opts.file.name,
      storagePath,
      mimeType: opts.file.type || "application/octet-stream",
      fileSize: opts.file.size,
      status: "UPLOADED",
    },
  });

  // The matching checklist task is the student's action item — mark it done
  // on upload; review outcome is tracked on the document itself.
  await prisma.applicationTask.updateMany({
    where: { applicationId: opts.applicationId, documentType: opts.documentType, status: { not: "COMPLETED" } },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  await logEvent(opts.applicationId, "DOCUMENT_UPLOADED", `${labelize(opts.documentType)} uploaded (v${versionNumber}).`);
  await recomputeDocumentDrivenStatus(opts.applicationId);

  return version;
}

export async function reviewDocumentVersion(opts: {
  versionId: string;
  reviewerId: string;
  decision: "APPROVED" | "REJECTED" | "CORRECTION_REQUIRED";
  comment?: string;
}) {
  const version = await prisma.documentVersion.update({
    where: { id: opts.versionId },
    data: {
      status: opts.decision,
      reviewedById: opts.reviewerId,
      reviewedAt: new Date(),
      reviewComment: opts.comment,
    },
    include: { document: true },
  });

  const eventType = opts.decision === "APPROVED" ? "DOCUMENT_APPROVED" : "DOCUMENT_REJECTED";
  const label = labelize(version.document.documentType);
  await logEvent(
    version.document.applicationId,
    eventType,
    `${label} ${opts.decision === "APPROVED" ? "approved" : opts.decision === "REJECTED" ? "rejected" : "needs correction"}.${
      opts.comment ? ` "${opts.comment}"` : ""
    }`,
    { actorUserId: opts.reviewerId },
  );

  await recomputeDocumentDrivenStatus(version.document.applicationId);
  return version;
}
