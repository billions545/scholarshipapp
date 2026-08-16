import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isStaffRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

// Stands in for a signed, temporary object-storage URL (PRD §33): every
// download goes through this access-controlled route rather than a public
// bucket link.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: { document: { include: { student: true } } },
  });
  if (!version) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = version.document.student.userId === user.id;
  if (!isOwner && !isStaffRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await readFile(version.storagePath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": version.mimeType,
      "Content-Disposition": `attachment; filename="${version.fileName.replace(/"/g, "")}"`,
      "Content-Length": String(version.fileSize),
    },
  });
}
