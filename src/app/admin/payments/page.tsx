import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { staffRequestRefundAction, decideRefundAction } from "@/lib/actions/payment-actions";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";
import { formatMoney } from "@/lib/money";
import { labelize } from "@/lib/enums";

export default async function AdminPaymentsPage() {
  const user = await requireStaff();
  if (!hasPermission(user.role, "payment.read")) {
    return <p className={ui.muted}>You don&apos;t have permission to view payments.</p>;
  }
  const canRefund = hasPermission(user.role, "payment.refund");

  const payments = await prisma.payment.findMany({
    include: { student: { include: { user: true } }, invoice: true, refunds: true },
    orderBy: { createdAt: "desc" },
  });

  const totalCollected = payments
    .filter((p) => p.status === "SUCCESSFUL")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingRefunds = canRefund
    ? await prisma.refund.findMany({
        where: { status: "REFUND_REQUESTED" },
        include: { payment: { include: { student: { include: { user: true } } } } },
        orderBy: { requestedAt: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className={ui.pageHeading}>Payments</h1>
      <div className={`${ui.card} mt-4 inline-block`}>
        <p className={ui.muted}>Total collected</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(totalCollected, "NGN")}</p>
      </div>

      {pendingRefunds.length > 0 && (
        <div className="mt-6">
          <h2 className={ui.sectionHeading}>Pending refund requests</h2>
          <div className="mt-3 flex flex-col gap-2">
            {pendingRefunds.map((r) => (
              <div key={r.id} className={`${ui.card} flex items-center justify-between py-3`}>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {r.payment.student.user.firstName} {r.payment.student.user.lastName} —{" "}
                    {formatMoney(r.amount, r.payment.currency)}
                  </p>
                  {r.reason && <p className="text-xs text-slate-500">{r.reason}</p>}
                </div>
                <div className="flex gap-2">
                  <form action={decideRefundAction.bind(null, r.id, "REFUNDED")}>
                    <SubmitButton pendingText="Marking...">Mark refunded</SubmitButton>
                  </form>
                  <form action={decideRefundAction.bind(null, r.id, "REFUND_REJECTED")}>
                    <SubmitButton variant="secondary" pendingText="Rejecting...">Reject</SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              {canRefund && <th className="px-4 py-3">Refund</th>}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {p.student.user.firstName} {p.student.user.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600">{p.invoice.description}</td>
                <td className="px-4 py-3 text-slate-600">{labelize(p.type)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(p.amount, p.currency)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                {canRefund && (
                  <td className="px-4 py-3">
                    {p.status === "SUCCESSFUL" && p.refunds.length === 0 && (
                      <form action={staffRequestRefundAction.bind(null, p.id)} className="flex items-center gap-1">
                        <input type="hidden" name="amount" value={p.amount} />
                        <input
                          className="w-32 rounded border border-slate-300 px-2 py-1 text-xs"
                          name="reason"
                          placeholder="Reason"
                        />
                        <SubmitButton variant="custom" pendingText="Requesting..." className="text-xs font-medium text-red-600 hover:text-red-700">
                          Request refund
                        </SubmitButton>
                      </form>
                    )}
                    {p.refunds.length > 0 && <StatusBadge status={p.refunds[0].status} />}
                  </td>
                )}
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={canRefund ? 7 : 6} className="px-4 py-8 text-center text-slate-400">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
