import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { createAgentAction } from "@/lib/actions/agent-actions";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";
import { formatMoney } from "@/lib/money";

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireStaff();
  const { error } = await searchParams;
  const canManage = hasPermission(user.role, "agent.manage");

  const agents = await prisma.user.findMany({
    where: { role: "AGENT" },
    include: {
      referredStudents: { select: { id: true } },
      agentCommissions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className={ui.pageHeading}>Agents</h1>
        <p className={`${ui.muted} mt-1`}>Independent referral partners bringing students into the platform.</p>

        <div className="mt-6 flex flex-col gap-3">
          {agents.map((a) => {
            const expected = a.agentCommissions.reduce((sum, c) => sum + c.agentShare, 0);
            const paid = a.agentCommissions
              .filter((c) => c.status === "PAID")
              .reduce((sum, c) => sum + c.agentShare, 0);
            return (
              <div key={a.id} className={ui.card}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {a.firstName} {a.lastName}
                    </p>
                    <p className={ui.muted}>{a.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Referral code</p>
                    <p className="font-mono text-sm font-semibold text-indigo-600">{a.referralCode}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-6 text-sm text-slate-600">
                  <span>{a.referredStudents.length} students</span>
                  <span>Expected {formatMoney(expected, "NGN")}</span>
                  <span>Paid {formatMoney(paid, "NGN")}</span>
                </div>
              </div>
            );
          })}
          {agents.length === 0 && <p className={ui.muted}>No agents yet.</p>}
        </div>
      </div>

      {canManage && (
        <div>
          <h2 className={ui.sectionHeading}>Add agent</h2>
          <form action={createAgentAction} className={`${ui.card} mt-3 flex flex-col gap-3`}>
            {error && <p className={`${ui.errorText} rounded-lg bg-red-50 p-3`}>{error}</p>}
            <div>
              <label className={ui.label}>First name</label>
              <input className={ui.input} name="firstName" required />
            </div>
            <div>
              <label className={ui.label}>Last name</label>
              <input className={ui.input} name="lastName" required />
            </div>
            <div>
              <label className={ui.label}>Email</label>
              <input className={ui.input} name="email" type="email" required />
            </div>
            <div>
              <label className={ui.label}>Temporary password</label>
              <input className={ui.input} name="password" type="password" minLength={8} required />
            </div>
            <SubmitButton pendingText="Creating...">Create agent</SubmitButton>
            <p className="text-xs text-slate-400">A unique referral code is generated automatically.</p>
          </form>
        </div>
      )}
    </div>
  );
}
