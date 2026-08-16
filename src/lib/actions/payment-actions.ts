"use server";

import { redirect } from "next/navigation";
import { requireStudent, requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { initiatePayment } from "@/lib/services/payment-service";
import { requestRefund, decideRefund } from "@/lib/services/payment-service";
import { MOCK_WEBHOOK_SECRET } from "@/lib/payments/mock-provider";

export async function payNowAction(applicationId: string) {
  const { user, profile } = await requireStudent();
  const invoice = await prisma.invoice.findFirst({
    where: { applicationId, studentId: profile.id, status: "UNPAID" },
    orderBy: { createdAt: "desc" },
  });
  if (!invoice) throw new Error("No outstanding invoice for this application.");

  const { checkoutUrl } = await initiatePayment(invoice.id, user.email ?? "student@example.com");
  redirect(checkoutUrl);
}

// Stands in for the real gateway calling our webhook after the student
// completes (or abandons) checkout on their hosted payment page. Calls the
// same webhook route a real provider would, so the confirmation path is
// identical to production.
export async function simulatePaymentOutcomeAction(
  reference: string,
  applicationId: string,
  outcome: "SUCCESSFUL" | "FAILED",
) {
  const { profile } = await requireStudent();
  const payment = await prisma.payment.findUnique({ where: { providerReference: reference } });
  if (!payment || payment.studentId !== profile.id) throw new Error("Payment not found.");

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  await fetch(`${baseUrl}/api/payments/webhooks/mock`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-mock-signature": MOCK_WEBHOOK_SECRET },
    body: JSON.stringify({ reference, outcome }),
  });

  redirect(`/app/applications/${applicationId}`);
}

export async function staffRequestRefundAction(paymentId: string, formData: FormData) {
  const user = await requireStaff();
  if (!hasPermission(user.role, "payment.refund")) throw new Error("Not permitted.");
  const amount = Number(formData.get("amount"));
  const reason = String(formData.get("reason") ?? "").trim() || undefined;
  await requestRefund(paymentId, amount, reason);
}

export async function decideRefundAction(
  refundId: string,
  status: "REFUND_APPROVED" | "REFUND_REJECTED" | "REFUNDED",
) {
  const user = await requireStaff();
  if (!hasPermission(user.role, "payment.refund")) throw new Error("Not permitted.");
  await decideRefund(refundId, status);
}
