import { MockPaymentProvider } from "@/lib/payments/mock-provider";
import { PaystackProvider } from "@/lib/payments/paystack-provider";
import type { PaymentProvider } from "@/lib/payments/types";

const providers: Record<string, PaymentProvider> = {
  MOCK: new MockPaymentProvider(),
  PAYSTACK: new PaystackProvider(),
  // MONNIFY: new MonnifyProvider(),  — add when real credentials exist
};

// Which provider is "active" is a deployment concern, not a code concern —
// controlled entirely by env (PRD §39: PaymentService never hardcodes a
// specific gateway). Defaults to MOCK so a fresh checkout without
// PAYMENT_PROVIDER set never accidentally hits a real gateway.
export function getActiveProviderName(): string {
  return process.env.PAYMENT_PROVIDER ?? "MOCK";
}

export function getPaymentProvider(name: string = getActiveProviderName()): PaymentProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown payment provider: ${name}`);
  return provider;
}

export type { PaymentProvider, InitializeParams, InitializeResult, VerifyResult } from "@/lib/payments/types";
