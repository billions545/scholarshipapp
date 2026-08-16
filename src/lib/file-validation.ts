// Never trust the filename or declared MIME type alone (PRD §90-91) — check
// the file's magic bytes against its extension before accepting an upload.
const MAGIC_CHECKS: Record<string, (buf: Buffer) => boolean> = {
  pdf: (buf) => buf.subarray(0, 4).toString("ascii") === "%PDF",
  png: (buf) => buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  jpg: (buf) => buf.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  jpeg: (buf) => buf.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  doc: (buf) => buf.subarray(0, 4).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0])),
  docx: (buf) => buf.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])),
};

export const ALLOWED_EXTENSIONS = Object.keys(MAGIC_CHECKS);
export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function validateUpload(fileName: string, size: number, buffer: Buffer): { ok: true } | { ok: false; error: string } {
  if (size <= 0) return { ok: false, error: "File is empty." };
  if (size > MAX_FILE_SIZE_BYTES) return { ok: false, error: "File exceeds the 15MB limit." };

  const ext = getExtension(fileName);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ").toUpperCase()}.` };
  }

  const check = MAGIC_CHECKS[ext];
  if (!check(buffer)) {
    return { ok: false, error: "The file's contents don't match its extension. Please re-export and try again." };
  }

  return { ok: true };
}
