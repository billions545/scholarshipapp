import { prisma } from "@/lib/prisma";

// Human-readable application numbers (PRD §75) — the DB still keys off the
// UUID `id`; this is purely a display/reference identifier.
export async function generateApplicationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.application.count();
  const sequence = String(count + 1).padStart(8, "0");
  return `APP-${year}-${sequence}`;
}

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const sequence = String(count + 1).padStart(8, "0");
  return `INV-${year}-${sequence}`;
}
