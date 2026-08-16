import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { approveCommissionAction, rejectCommissionAction, markCommissionPaidAction } from "@/lib/actions/commission-actions";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import { formatMoney } from "@/lib/money";
import { labelize } from "@/lib/enums";

export default async function AdminCommissionsPage() {
  const user = await requireStaff();
  if (!hasPermission(user.role, "commission.read")) {
    return <p className={ui.muted}>You don&apos;t have permission to view commissions.</p>;
  }
  const canApprove = hasPermission(user.role, "commission.approve");

  const commissions = await prisma.commission.findMany({
    include: {
      partner: true,
      student: { include: { user: true } },
      agent: true,
      application: { include: { opportunity: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totals = commissions.reduce(
    (acc, c) => {
      acc.expected += c.amount;
      if (c.status === "APPROVED" || c.status === "INVOICED") acc.approved += c.amount;
      if (c.status === "PAID") acc.paid += c.amount;
      return acc;
    },
    { expected: 0, approved: 0, paid: 0 },
  );

  return (
    <div>
      <h1 className={ui.pageHeading}>Commissions</h1>

      <div className="mt-4 grid grid-cols-3 gap-4 sm:w-fit">
        <div className={ui.card}>
          <p className={ui.muted}>Expected</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatMoney(totals.expected, "NGN")}</p>
        </div>
        <div className={ui.card}>
          <p className={ui.muted}>Approved</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatMoney(totals.approved, "NGN")}</p>
        </div>
        <div className={ui.card}>
          <p className={ui.muted}>Paid</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatMoney(totals.paid, "NGN")}</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Agent share</th>
              <th className="px-4 py-3">Status</th>
              {canApprove && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {c.student.user.firstName} {c.student.user.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.partner.name}</td>
                <td className="px-4 py-3 text-slate-600">
                  {c.agent ? `${c.agent.firstName} ${c.agent.lastName}` : "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{labelize(c.triggerEvent)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(c.amount, c.currency)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(c.agentShare, c.currency)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                {canApprove && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {c.status === "EXPECTED" && (
                        <>
                          <form action={approveCommissionAction.bind(null, c.id)}>
                            <button type="submit" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                              Approve
                            </button>
                          </form>
                          <form action={rejectCommissionAction.bind(null, c.id)}>
                            <button type="submit" className="text-xs font-medium text-red-600 hover:text-red-700">
                              Reject
                            </button>
                          </form>
                        </>
                      )}
                      {c.status === "APPROVED" && (
                        <form action={markCommissionPaidAction.bind(null, c.id)}>
                          <button type="submit" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                            Mark paid
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr>
                <td colSpan={canApprove ? 8 : 7} className="px-4 py-8 text-center text-slate-400">
                  No commissions recorded yet. They&apos;re created automatically when a commission rule&apos;s
                  trigger event fires (e.g. a student enrols).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
