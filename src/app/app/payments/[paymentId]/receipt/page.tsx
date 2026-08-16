import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { ui } from "@/lib/ui";
import { formatMoney } from "@/lib/money";
import { labelize } from "@/lib/enums";

export default async function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const { profile } = await requireStudent();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: true, application: { include: { opportunity: true } } },
  });
  if (!payment || payment.studentId !== profile.id || payment.status !== "SUCCESSFUL") notFound();

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className={ui.card}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">Receipt</h1>
          <span className="text-xs text-slate-400">{payment.invoice.invoiceNumber}</span>
        </div>
        <p className={`${ui.muted} mt-1`}>Paid on {new Date(payment.paidAt!).toLocaleDateString()}</p>

        <dl className="mt-6 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Description</dt>
            <dd className="font-medium text-slate-900">{payment.invoice.description}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Type</dt>
            <dd className="font-medium text-slate-900">{labelize(payment.type)}</dd>
          </div>
          {payment.application && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Application</dt>
              <dd className="font-medium text-slate-900">{payment.application.opportunity.title}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-slate-500">Reference</dt>
            <dd className="font-mono text-xs text-slate-700">{payment.providerReference}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
            <dt className="font-semibold text-slate-900">Amount paid</dt>
            <dd className="font-bold text-slate-900">{formatMoney(payment.amount, payment.currency)}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-slate-400">
          This receipt confirms payment of the stated administration fee to Edu Bridge Point. It is not proof of
          admission, enrolment, or any scholarship outcome.
        </p>
      </div>

      {payment.applicationId && (
        <Link href={`/app/applications/${payment.applicationId}`} className={`${ui.btnSecondary} mt-4 inline-flex`}>
          Back to application
        </Link>
      )}
    </div>
  );
}
