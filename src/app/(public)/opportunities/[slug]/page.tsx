import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { evaluateEligibility } from "@/lib/eligibility";
import { getStudentFacts } from "@/lib/services/student-service";
import { applyToOpportunityAction } from "@/lib/actions/application-actions";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";
import { labelize } from "@/lib/enums";
import { formatMoney as money } from "@/lib/money";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { slug },
    include: {
      programme: { include: { university: { include: { partner: true } } } },
      eligibilityRules: true,
      documentRequirements: true,
    },
  });
  if (!opportunity || opportunity.status !== "PUBLISHED") notFound();

  const user = await getCurrentUser();
  let existingApplicationId: string | null = null;
  let report: ReturnType<typeof evaluateEligibility> | null = null;

  if (user?.role === "STUDENT") {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (profile) {
      const [facts, existing] = await Promise.all([
        getStudentFacts(profile.id),
        prisma.application.findFirst({
          where: { studentId: profile.id, opportunityId: opportunity.id, status: { notIn: ["WITHDRAWN", "CANCELLED"] } },
        }),
      ]);
      report = evaluateEligibility(opportunity.eligibilityRules, facts);
      existingApplicationId = existing?.id ?? null;
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/opportunities" className={ui.muted}>
        &larr; Browse opportunities
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            {labelize(opportunity.type)} {opportunity.category ? `- ${labelize(opportunity.category)}` : ""}
          </p>
          <h1 className={`${ui.pageHeading} mt-1`}>{opportunity.title}</h1>
          <p className={`${ui.muted} mt-1`}>
            {opportunity.programme.university.name} - {opportunity.city ? `${opportunity.city}, ` : ""}
            {opportunity.country ?? opportunity.programme.university.country}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {opportunity.description && (
            <section>
              <h2 className={ui.sectionHeading}>About this opportunity</h2>
              <p className="mt-2 whitespace-pre-line text-slate-700">{opportunity.description}</p>
            </section>
          )}
          {opportunity.benefits && (
            <section>
              <h2 className={ui.sectionHeading}>Benefits</h2>
              <p className="mt-2 whitespace-pre-line text-slate-700">{opportunity.benefits}</p>
            </section>
          )}
          {opportunity.applicationProcessDescription && (
            <section>
              <h2 className={ui.sectionHeading}>Application process</h2>
              <p className="mt-2 whitespace-pre-line text-slate-700">{opportunity.applicationProcessDescription}</p>
            </section>
          )}

          <section>
            <h2 className={ui.sectionHeading}>Eligibility requirements</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {opportunity.eligibilityRules.map((r) => {
                const evalResult = report?.evaluations.find((e) => e.ruleId === r.id);
                return (
                  <li key={r.id} className="flex items-center gap-2 text-sm text-slate-700">
                    {evalResult ? (
                      <span>
                        {evalResult.met === true ? "✅" : evalResult.met === false ? "❌" : "❓"}
                      </span>
                    ) : (
                      <span className="text-slate-300">&bull;</span>
                    )}
                    {r.label} {!r.required && <span className="text-xs text-slate-400">(informational)</span>}
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h2 className={ui.sectionHeading}>Required documents</h2>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-700">
              {opportunity.documentRequirements.map((dr) => (
                <li key={dr.id}>
                  {labelize(dr.documentType)}{" "}
                  <span className="text-xs text-slate-400">
                    ({dr.required ? "required" : "optional"}{dr.conditional ? `, conditional: ${dr.conditionDescription}` : ""})
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <div className={ui.card}>
            <dl className="flex flex-col gap-3 text-sm">
              {opportunity.deadline && (
                <div>
                  <dt className="text-slate-400">Application deadline</dt>
                  <dd className="font-medium text-slate-900">{new Date(opportunity.deadline).toLocaleDateString()}</dd>
                </div>
              )}
              {opportunity.intake && (
                <div>
                  <dt className="text-slate-400">Intake</dt>
                  <dd className="font-medium text-slate-900">{opportunity.intake}</dd>
                </div>
              )}
              {money(opportunity.scholarshipAmount, "NGN") && (
                <div>
                  <dt className="text-slate-400">Scholarship amount</dt>
                  <dd className="font-medium text-slate-900">{money(opportunity.scholarshipAmount, "NGN")}</dd>
                </div>
              )}
              {opportunity.scholarshipPercentage && (
                <div>
                  <dt className="text-slate-400">Scholarship coverage</dt>
                  <dd className="font-medium text-slate-900">{opportunity.scholarshipPercentage}%</dd>
                </div>
              )}
              {money(opportunity.tuitionAmount, opportunity.tuitionCurrency) && (
                <div>
                  <dt className="text-slate-400">Tuition</dt>
                  <dd className="font-medium text-slate-900">{money(opportunity.tuitionAmount, opportunity.tuitionCurrency)}</dd>
                </div>
              )}
              {money(opportunity.serviceFeeAmount, opportunity.serviceFeeCurrency) && (
                <div>
                  <dt className="text-slate-400">Administration fee</dt>
                  <dd className="font-medium text-slate-900">{money(opportunity.serviceFeeAmount, opportunity.serviceFeeCurrency)}</dd>
                </div>
              )}
              {opportunity.languageRequirement && (
                <div>
                  <dt className="text-slate-400">Language requirement</dt>
                  <dd className="font-medium text-slate-900">{opportunity.languageRequirement}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className={ui.card}>
            <h3 className="font-semibold text-slate-900">Your eligibility</h3>
            {!user && (
              <div className="mt-3">
                <p className={ui.muted}>Sign in to check your personalised eligibility.</p>
                <Link href="/register" className={`${ui.btnPrimary} mt-3 w-full`}>
                  Get started
                </Link>
              </div>
            )}
            {user && user.role !== "STUDENT" && (
              <p className={`${ui.muted} mt-3`}>Staff accounts don&apos;t apply to opportunities.</p>
            )}
            {user && user.role === "STUDENT" && report && (
              <div className="mt-3">
                <StatusBadge status={report.result} />
                {report.result !== "ELIGIBLE" && report.missing.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
                    {report.missing.map((m) => (
                      <li key={m}>&bull; {m}</li>
                    ))}
                  </ul>
                )}

                {existingApplicationId ? (
                  <Link href={`/app/applications/${existingApplicationId}`} className={`${ui.btnSecondary} mt-4 w-full`}>
                    View my application
                  </Link>
                ) : (
                  <form action={applyToOpportunityAction.bind(null, opportunity.id)}>
                    <SubmitButton className="mt-4 w-full" pendingText="Starting application...">
                      Apply now
                    </SubmitButton>
                  </form>
                )}
                {report.result === "NOT_ELIGIBLE" && !existingApplicationId && (
                  <p className="mt-2 text-xs text-slate-400">
                    You can still apply — our advisers will review your application manually.
                  </p>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400">
            All admission and scholarship decisions remain with {opportunity.programme.university.name}. Edu Bridge
            Point guides your application but does not guarantee outcomes.
          </p>
        </aside>
      </div>
    </div>
  );
}
