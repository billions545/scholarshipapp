import { prisma } from "@/lib/prisma";
import type { InitializeParams, InitializeResult, PaymentProvider, VerifyResult } from "@/lib/payments/types";

// Local stand-in for Paystack/Monnify — no real gateway credentials exist in
// this environment. Sends the student to our own simulated hosted-checkout
// page instead of a real one; everything else (Payment/Invoice records,
// webhook confirmation, idempotency) works exactly as it would with a real
// provider, so swapping this out later is a drop-in change.
export const MOCK_WEBHOOK_SECRET = "dev-mock-webhook-secret";

export class MockPaymentProvider implements PaymentProvider {
  readonly name = "MOCK";

  async initialize(params: InitializeParams): Promise<InitializeResult> {
    return {
      authorizationUrl: `/app/payments/checkout/${params.reference}`,
      reference: params.reference,
    };
  }

  async verify(reference: string): Promise<VerifyResult> {
    const payment = await prisma.payment.findUnique({ where: { providerReference: reference } });
    if (!payment) return { success: false, amount: 0, currency: "NGN", reference };
    return {
      success: payment.status === "SUCCESSFUL",
      amount: payment.amount,
      currency: payment.currency,
      reference,
    };
  }
}
