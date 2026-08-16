import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { confirmPayment } from "@/lib/services/payment-service";
import { MOCK_WEBHOOK_SECRET } from "@/lib/payments/mock-provider";

// Provider webhook endpoint (PRD §41, §82, §137): signature verification,
// idempotent processing, never trusting the frontend redirect alone.
export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;

  // Signature verification must run over the exact raw request bytes, so
  // read text before any JSON parsing.
  const rawBody = await req.text();

  if (provider === "mock") {
    const signature = req.headers.get("x-mock-signature");
    if (signature !== MOCK_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody || "{}");
    const reference = body?.reference as string | undefined;
    const outcome = body?.outcome as "SUCCESSFUL" | "FAILED" | undefined;
    if (!reference || !outcome) {
      return NextResponse.json({ error: "Missing reference or outcome" }, { status: 400 });
    }

    await confirmPayment(reference, outcome);
    return NextResponse.json({ received: true });
  }

  if (provider === "paystack") {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: "Paystack is not configured" }, { status: 500 });

    const signature = req.headers.get("x-paystack-signature");
    const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (!signature || signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody || "{}");
    const reference = event?.data?.reference as string | undefined;

    // Only act on events that resolve a payment we initiated; acknowledge
    // everything else with 200 so Paystack doesn't keep retrying it.
    if (reference && event.event === "charge.success") {
      await confirmPayment(reference, "SUCCESSFUL");
    } else if (reference && (event.event === "charge.failed" || event.event === "transaction.failed")) {
      await confirmPayment(reference, "FAILED");
    }

    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
}
