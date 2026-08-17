import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { simulatePaymentOutcomeAction } from "@/lib/actions/payment-actions";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";
import { formatMoney } from "@/lib/money";

export default async function MockCheckoutPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const { profile } = await requireStudent();

  const payment = await prisma.payment.findUnique({
    where: { providerReference: reference },
    include: { invoice: true },
  });
  if (!payment || payment.studentId !== profile.id) notFound();

  if (payment.status !== "PENDING") {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className={ui.pageHeading}>Payment already processed</h1>
        <p className={`${ui.muted} mt-2`}>This payment was already marked {payment.status.toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className={ui.card}>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Simulated checkout</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">Edu Bridge Point Payments</h1>
        <p className={`${ui.muted} mt-1`}>
          This stands in for a real gateway (Paystack/Monnify) — no money moves. In production this page belongs
          to the payment provider.
        </p>

        <div className="mt-6 rounded-lg bg-slate-50 p-4">
          <p className="text-sm text-slate-500">{payment.invoice.description}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(payment.amount, payment.currency)}</p>
          <p className="mt-1 text-xs text-slate-400">Reference: {payment.providerReference}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <form
            action={simulatePaymentOutcomeAction.bind(null, reference, payment.applicationId ?? "", "SUCCESSFUL")}
          >
            <SubmitButton className="w-full" pendingText="Processing...">
              Simulate successful payment
            </SubmitButton>
          </form>
          <form action={simulatePaymentOutcomeAction.bind(null, reference, payment.applicationId ?? "", "FAILED")}>
            <SubmitButton variant="secondary" className="w-full" pendingText="Processing...">
              Simulate failed payment
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
