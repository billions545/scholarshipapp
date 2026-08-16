import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getAgentDashboardData } from "@/lib/services/agent-service";
import { ui } from "@/lib/ui";
import { formatMoney } from "@/lib/money";
import { ReferralLinkCard } from "@/components/referral-link-card";

export default async function AgentDashboardPage() {
  const user = await requireAgent();
  const [agentUser, data] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
    getAgentDashboardData(user.id),
  ]);

  const stats = [
    ["Students", data.stats.studentCount],
    ["Active applications", data.stats.activeApplications],
    ["Submitted", data.stats.submitted],
    ["Accepted", data.stats.accepted],
    ["Enrolled", data.stats.enrolled],
  ] as const;

  return (
    <div>
      <h1 className={ui.pageHeading}>My dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className={ui.card}>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className={`${ui.muted} mt-1`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className={ui.card}>
          <p className={ui.muted}>Expected commission</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(data.expectedCommission, "NGN")}</p>
        </div>
        <div className={ui.card}>
          <p className={ui.muted}>Paid commission</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(data.paidCommission, "NGN")}</p>
        </div>
      </div>

      <div className="mt-6">
        <ReferralLinkCard referralCode={agentUser.referralCode ?? ""} />
      </div>
    </div>
  );
}
