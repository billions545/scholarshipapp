import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createUniversityAction } from "@/lib/actions/catalog-actions";
import { createCommissionRuleAction } from "@/lib/actions/commission-actions";
import { requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";
import { COMMISSION_TRIGGER_EVENTS, COMMISSION_PERCENTAGE_BASES, labelize } from "@/lib/enums";

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  const canManageCommissions = hasPermission(user.role, "commission.approve");

  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      universities: { include: { programmes: { include: { opportunities: true } } } },
      commissionRules: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!partner) notFound();

  const opportunities = partner.universities.flatMap((u) => u.programmes.flatMap((p) => p.opportunities));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Link href="/admin/partners" className={ui.muted}>
          &larr; Partners
        </Link>
        <h1 className={`${ui.pageHeading} mt-1`}>{partner.name}</h1>
        <p className={ui.muted}>
          {labelize(partner.type)} {partner.country ? `- ${partner.country}` : ""}
        </p>

        <h2 className={`${ui.sectionHeading} mt-8`}>Universities</h2>
        <div className="mt-3 flex flex-col gap-3">
          {partner.universities.length === 0 && (
            <p className={ui.muted}>No universities under this partner yet.</p>
          )}
          {partner.universities.map((u) => (
            <Link key={u.id} href={`/admin/universities/${u.id}`} className={`${ui.card} block hover:border-indigo-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{u.name}</p>
                  <p className={ui.muted}>{u.city ? `${u.city}, ` : ""}{u.country}</p>
                </div>
                <p className={ui.muted}>{u.programmes.length} programmes</p>
              </div>
            </Link>
          ))}
        </div>

        {canManageCommissions && (
          <>
            <h2 className={`${ui.sectionHeading} mt-8`}>Commission rules</h2>
            <div className="mt-3 flex flex-col gap-2">
              {partner.commissionRules.map((r) => (
                <div key={r.id} className={`${ui.card} flex items-center justify-between py-3`}>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {labelize(r.triggerEvent)} &rarr;{" "}
                      {r.amountType === "FIXED"
                        ? `${(r.fixedAmount ?? 0) / 100} minor units fixed`
                        : `${r.percentage}% of ${labelize(r.percentageBasis ?? "")}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      Agent share: {r.agentSharePercentage}% {r.active ? "" : "(inactive)"}
                    </p>
                  </div>
                </div>
              ))}
              {partner.commissionRules.length === 0 && (
                <p className={ui.muted}>No commission rules configured — enrolments here won&apos;t generate commissions.</p>
              )}
            </div>

            <form action={createCommissionRuleAction} className={`${ui.card} mt-3 flex flex-col gap-3`}>
              <input type="hidden" name="partnerId" value={partner.id} />
              <div>
                <label className={ui.label}>Applies to</label>
                <select className={ui.input} name="opportunityId" defaultValue="">
                  <option value="">All opportunities from this partner</option>
                  {opportunities.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={ui.label}>Trigger event</label>
                <select className={ui.input} name="triggerEvent" required>
                  {COMMISSION_TRIGGER_EVENTS.map((t) => (
                    <option key={t} value={t}>
                      {labelize(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={ui.label}>Amount type</label>
                  <select className={ui.input} name="amountType" required>
                    <option value="FIXED">Fixed</option>
                    <option value="PERCENTAGE">Percentage</option>
                  </select>
                </div>
                <div>
                  <label className={ui.label}>Agent share %</label>
                  <input className={ui.input} name="agentSharePercentage" type="number" min={0} max={100} defaultValue={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={ui.label}>Fixed amount (minor units)</label>
                  <input className={ui.input} name="fixedAmount" type="number" />
                </div>
                <div>
                  <label className={ui.label}>Percentage</label>
                  <input className={ui.input} name="percentage" type="number" min={0} max={100} />
                </div>
              </div>
              <div>
                <label className={ui.label}>Percentage basis</label>
                <select className={ui.input} name="percentageBasis">
                  {COMMISSION_PERCENTAGE_BASES.map((b) => (
                    <option key={b} value={b}>
                      {labelize(b)}
                    </option>
                  ))}
                </select>
              </div>
              <SubmitButton variant="secondary" className="self-start" pendingText="Adding...">
                Add commission rule
              </SubmitButton>
            </form>
          </>
        )}
      </div>

      <div>
        <h2 className={ui.sectionHeading}>Add university</h2>
        <form action={createUniversityAction} className={`${ui.card} mt-3 flex flex-col gap-3`}>
          <input type="hidden" name="partnerId" value={partner.id} />
          <div>
            <label className={ui.label}>Name</label>
            <input className={ui.input} name="name" required />
          </div>
          <div>
            <label className={ui.label}>Country</label>
            <input className={ui.input} name="country" defaultValue={partner.country ?? ""} />
          </div>
          <div>
            <label className={ui.label}>City</label>
            <input className={ui.input} name="city" />
          </div>
          <div>
            <label className={ui.label}>Website</label>
            <input className={ui.input} name="website" />
          </div>
          <SubmitButton pendingText="Adding...">Add university</SubmitButton>
        </form>
      </div>
    </div>
  );
}
