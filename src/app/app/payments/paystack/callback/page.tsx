import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/session";
import { getPaymentProvider } from "@/lib/payments";
import { confirmPayment } from "@/lib/services/payment-service";
import { prisma } from "@/lib/prisma";
import { ui } from "@/lib/ui";

// Paystack (like most gateways) can't reach a localhost webhook, so this
// page is the confirmation path for local/dev use: when the student's
// browser is redirected back here, we call Paystack's server-side verify
// API (PRD §41's "Verify Transaction" step) rather than trusting the query
// string. In production, the webhook route is the primary path and this
// page becomes a corroborating check.
export default async function PaystackCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { profile } = await requireStudent();
  const { reference: refParam, trxref } = await searchParams;
  const reference = refParam ?? trxref;

  if (!reference) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className={ui.pageHeading}>Missing payment reference</h1>
      </div>
    );
  }

  const payment = await prisma.payment.findUnique({ where: { providerReference: reference } });
  if (!payment || payment.studentId !== profile.id) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className={ui.pageHeading}>We couldn&apos;t find this payment</h1>
      </div>
    );
  }

  if (payment.status === "PENDING") {
    const provider = getPaymentProvider();
    const result = await provider.verify(reference);
    if (result.success) {
      await confirmPayment(reference, "SUCCESSFUL");
    }
  }

  const updated = await prisma.payment.findUniqueOrThrow({ where: { id: payment.id } });

  if (updated.status === "SUCCESSFUL") {
    redirect(`/app/applications/${updated.applicationId}`);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className={ui.pageHeading}>Payment not yet confirmed</h1>
      <p className={`${ui.muted} mt-2`}>
        We couldn&apos;t confirm this payment yet. If you completed checkout, this can take a moment — refresh this
        page, or check your application shortly.
      </p>
    </div>
  );
}
