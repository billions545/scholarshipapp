import type { InitializeParams, InitializeResult, PaymentProvider, VerifyResult } from "@/lib/payments/types";

const PAYSTACK_API_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return key;
}

// Real Paystack integration (PRD §39, §85). Amounts are already stored in
// minor units (kobo for NGN) throughout this app, which is exactly the unit
// Paystack's API expects — no conversion needed.
export class PaystackProvider implements PaymentProvider {
  readonly name = "PAYSTACK";

  async initialize(params: InitializeParams): Promise<InitializeResult> {
    const callbackUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/app/payments/paystack/callback`;

    const res = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amount,
        currency: params.currency,
        reference: params.reference,
        callback_url: callbackUrl,
        metadata: params.metadata ?? {},
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.status) {
      throw new Error(json.message ?? "Failed to initialize Paystack transaction.");
    }

    return {
      authorizationUrl: json.data.authorization_url,
      reference: json.data.reference,
    };
  }

  async verify(reference: string): Promise<VerifyResult> {
    const res = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey()}` },
    });

    const json = await res.json();
    if (!res.ok || !json.status) {
      return { success: false, amount: 0, currency: "NGN", reference };
    }

    return {
      success: json.data?.status === "success",
      amount: json.data?.amount ?? 0,
      currency: json.data?.currency ?? "NGN",
      reference,
    };
  }
}
