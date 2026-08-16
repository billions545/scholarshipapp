import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payments";
import { formatMoney } from "@/lib/money";
import { logEvent, advanceApplicationAfterPayment } from "@/lib/services/application-service";

export class InvoiceAlreadyPaidError extends Error {
  constructor() {
    super("This invoice has already been paid.");
  }
}

// Starts a payment attempt against an unpaid invoice (PRD §41: Initiated ->
// Pending -> Provider Checkout). Returns the URL to send the student to.
export async function initiatePayment(invoiceId: string, payerEmail: string) {
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  if (invoice.status === "PAID") throw new InvoiceAlreadyPaidError();

  const provider = getPaymentProvider();
  const reference = `PAY-${randomUUID()}`;
  const init = await provider.initialize({
    amount: invoice.amount,
    currency: invoice.currency,
    email: payerEmail,
    reference,
  });

  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      applicationId: invoice.applicationId,
      type: invoice.type,
      amount: invoice.amount,
      currency: invoice.currency,
      provider: provider.name,
      providerReference: init.reference,
      status: "PENDING",
    },
  });

  if (invoice.applicationId) {
    await logEvent(
      invoice.applicationId,
      "PAYMENT_INITIATED",
      `Payment initiated for ${invoice.description} (${formatMoney(invoice.amount, invoice.currency)}).`,
    );
  }

  return { payment, checkoutUrl: init.authorizationUrl };
}

// Webhook-style confirmation (PRD §41, §137). Never trust the frontend
// redirect alone — this is the single place that marks a payment
// successful, and it's idempotent: calling it twice for the same
// reference is a no-op the second time.
export async function confirmPayment(providerReference: string, outcome: "SUCCESSFUL" | "FAILED") {
  const payment = await prisma.payment.findUnique({ where: { providerReference } });
  if (!payment) throw new Error("Payment not found.");

  if (payment.status !== "PENDING") {
    return payment; // already processed — idempotent
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: outcome, paidAt: outcome === "SUCCESSFUL" ? new Date() : undefined },
  });

  if (outcome === "SUCCESSFUL") {
    await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: "PAID" } });
    if (payment.applicationId) {
      await logEvent(
        payment.applicationId,
        "PAYMENT_SUCCEEDED",
        `Payment of ${formatMoney(payment.amount, payment.currency)} received.`,
      );
      await advanceApplicationAfterPayment(payment.applicationId);
    }
  } else if (payment.applicationId) {
    await logEvent(payment.applicationId, "PAYMENT_FAILED", "Payment attempt failed.");
  }

  return updated;
}

export async function requestRefund(paymentId: string, amount: number, reason?: string) {
  return prisma.refund.create({
    data: { paymentId, amount, reason, status: "REFUND_REQUESTED" },
  });
}

export async function decideRefund(refundId: string, status: "REFUND_APPROVED" | "REFUND_REJECTED" | "REFUNDED") {
  return prisma.refund.update({
    where: { id: refundId },
    data: { status, processedAt: status === "REFUNDED" ? new Date() : undefined },
  });
}
