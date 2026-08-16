import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateOpportunityAction,
  setOpportunityStatusAction,
  addEligibilityRuleAction,
  removeEligibilityRuleAction,
  addDocumentRequirementAction,
  removeDocumentRequirementAction,
} from "@/lib/actions/catalog-actions";
import { OpportunityForm } from "@/components/opportunity-form";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import {
  ELIGIBILITY_OPERATORS,
  ELIGIBILITY_FIELDS,
  DOCUMENT_TYPES,
  labelize,
} from "@/lib/enums";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [opportunity, programmes] = await Promise.all([
    prisma.opportunity.findUnique({
      where: { id },
      include: {
        programme: { include: { university: true } },
        eligibilityRules: { orderBy: { createdAt: "asc" } },
        documentRequirements: { orderBy: { createdAt: "asc" } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.programme.findMany({ include: { university: true }, orderBy: { name: "asc" } }),
  ]);
  if (!opportunity) notFound();

  const options = programmes.map((p) => ({ id: p.id, name: p.name, universityName: p.university.name }));
  const boundUpdate = updateOpportunityAction.bind(null, opportunity.id);

  const canPublish =
    opportunity.eligibilityRules.length > 0 && opportunity.documentRequirements.length > 0;

  return (
    <div>
      <Link href="/admin/opportunities" className={ui.muted}>
        &larr; Opportunities
      </Link>

      <div className="mt-1 flex items-center justify-between">
        <div>
          <h1 className={ui.pageHeading}>{opportunity.title}</h1>
          <p className={ui.muted}>
            {opportunity.programme.university.name} - {opportunity.programme.name} -{" "}
            {opportunity._count.applications} application(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={opportunity.status} />
          {opportunity.status !== "PUBLISHED" && (
            <form action={setOpportunityStatusAction.bind(null, opportunity.id, "PUBLISHED")}>
              <button type="submit" className={ui.btnPrimary} disabled={!canPublish} title={!canPublish ? "Add at least one eligibility rule and one document requirement first" : undefined}>
                Publish
              </button>
            </form>
          )}
          {opportunity.status === "PUBLISHED" && (
            <form action={setOpportunityStatusAction.bind(null, opportunity.id, "ARCHIVED")}>
              <button type="submit" className={ui.btnSecondary}>
                Unpublish
              </button>
            </form>
          )}
        </div>
      </div>
      {!canPublish && opportunity.status !== "PUBLISHED" && (
        <p className="mt-2 text-sm text-amber-700">
          Add at least one eligibility rule and one document requirement before publishing.
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className={ui.sectionHeading}>Details</h2>
          <div className="mt-3">
            <OpportunityForm
              action={boundUpdate}
              programmes={options}
              defaults={opportunity}
              submitLabel="Save changes"
              lockProgramme
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h2 className={ui.sectionHeading}>Eligibility rules</h2>
            <p className={`${ui.muted} mt-1`}>
              Deterministic requirements evaluated against each student&apos;s profile.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {opportunity.eligibilityRules.map((r) => (
                <div key={r.id} className={`${ui.card} flex items-center justify-between py-3`}>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.label}</p>
                    <p className="text-xs text-slate-500">
                      {r.field} {labelize(r.operator)} &ldquo;{r.value}&rdquo; -{" "}
                      {r.required ? "Required" : "Informational"}
                    </p>
                  </div>
                  <form action={removeEligibilityRuleAction.bind(null, r.id, opportunity.id)}>
                    <button type="submit" className="text-xs font-medium text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </form>
                </div>
              ))}
              {opportunity.eligibilityRules.length === 0 && (
                <p className={ui.muted}>No rules yet — this opportunity can&apos;t be published.</p>
              )}
            </div>

            <form action={addEligibilityRuleAction} className={`${ui.card} mt-3 flex flex-col gap-3`}>
              <input type="hidden" name="opportunityId" value={opportunity.id} />
              <div>
                <label className={ui.label}>Requirement label</label>
                <input className={ui.input} name="label" required placeholder="Bachelor's degree required" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={ui.label}>Field</label>
                  <select className={ui.input} name="field" required>
                    {ELIGIBILITY_FIELDS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={ui.label}>Operator</label>
                  <select className={ui.input} name="operator" required>
                    {ELIGIBILITY_OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {labelize(op)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={ui.label}>Value</label>
                  <input className={ui.input} name="value" placeholder="BACHELOR / 3.0 / NG" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="required" defaultChecked className="rounded border-slate-300" />
                Required (failing this makes the applicant NOT ELIGIBLE)
              </label>
              <button type="submit" className={`${ui.btnSecondary} self-start`}>
                Add rule
              </button>
            </form>
          </div>

          <div>
            <h2 className={ui.sectionHeading}>Document requirements</h2>
            <div className="mt-3 flex flex-col gap-2">
              {opportunity.documentRequirements.map((dr) => (
                <div key={dr.id} className={`${ui.card} flex items-center justify-between py-3`}>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{labelize(dr.documentType)}</p>
                    <p className="text-xs text-slate-500">
                      {dr.required ? "Required" : "Optional"}
                      {dr.conditional ? ` - Conditional: ${dr.conditionDescription ?? ""}` : ""}
                    </p>
                  </div>
                  <form action={removeDocumentRequirementAction.bind(null, dr.id, opportunity.id)}>
                    <button type="submit" className="text-xs font-medium text-red-600 hover:text-red-700">
                      Remove
                    </button>
                  </form>
                </div>
              ))}
              {opportunity.documentRequirements.length === 0 && (
                <p className={ui.muted}>No document requirements yet — this opportunity can&apos;t be published.</p>
              )}
            </div>

            <form action={addDocumentRequirementAction} className={`${ui.card} mt-3 flex flex-col gap-3`}>
              <input type="hidden" name="opportunityId" value={opportunity.id} />
              <div>
                <label className={ui.label}>Document type</label>
                <select className={ui.input} name="documentType" required>
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {labelize(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="required" defaultChecked className="rounded border-slate-300" />
                  Required
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="conditional" className="rounded border-slate-300" />
                  Conditional
                </label>
              </div>
              <div>
                <label className={ui.label}>Condition description (optional)</label>
                <input className={ui.input} name="conditionDescription" placeholder="If IELTS unavailable" />
              </div>
              <button type="submit" className={`${ui.btnSecondary} self-start`}>
                Add requirement
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
