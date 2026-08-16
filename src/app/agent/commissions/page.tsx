import { requireAgent } from "@/lib/session";
import { getAgentDashboardData } from "@/lib/services/agent-service";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import { formatMoney } from "@/lib/money";
import { labelize } from "@/lib/enums";

export default async function AgentCommissionsPage() {
  const user = await requireAgent();
  const { commissions } = await getAgentDashboardData(user.id);

  const withDetails = await prisma.commission.findMany({
    where: { id: { in: commissions.map((c) => c.id) } },
    include: { student: { include: { user: true } }, application: { include: { opportunity: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className={ui.pageHeading}>Commissions</h1>
      <p className={`${ui.muted} mt-1`}>Your share of commission from students you referred.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Opportunity</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Your share</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {withDetails.map((c) => (
              <tr key={c.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {c.student.user.firstName} {c.student.user.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.application.opportunity.title}</td>
                <td className="px-4 py-3 text-slate-600">{labelize(c.triggerEvent)}</td>
                <td className="px-4 py-3 text-slate-600">{formatMoney(c.agentShare, c.currency)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
            {withDetails.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No commissions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
