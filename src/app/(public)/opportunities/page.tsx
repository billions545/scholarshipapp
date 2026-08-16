import { listPublishedOpportunities } from "@/lib/services/catalog-service";
import { prisma } from "@/lib/prisma";
import { ui } from "@/lib/ui";
import { OpportunityCard } from "@/components/opportunity-card";
import { OPPORTUNITY_TYPES, DEGREE_LEVELS, labelize } from "@/lib/enums";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; type?: string; degreeLevel?: string }>;
}) {
  const filters = await searchParams;
  const [opportunities, countries] = await Promise.all([
    listPublishedOpportunities(filters),
    prisma.opportunity.findMany({
      where: { status: "PUBLISHED", country: { not: null } },
      select: { country: true },
      distinct: ["country"],
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className={ui.pageHeading}>Browse opportunities</h1>
      <p className={`${ui.muted} mt-1`}>
        Scholarships, university programmes, fellowships and more.
      </p>

      <form className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <input
          className={ui.input}
          name="q"
          defaultValue={filters.q}
          placeholder="Search e.g. Computer Science"
        />
        <select className={ui.input} name="country" defaultValue={filters.country}>
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.country} value={c.country ?? ""}>
              {c.country}
            </option>
          ))}
        </select>
        <select className={ui.input} name="type" defaultValue={filters.type}>
          <option value="">All types</option>
          {OPPORTUNITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {labelize(t)}
            </option>
          ))}
        </select>
        <select className={ui.input} name="degreeLevel" defaultValue={filters.degreeLevel}>
          <option value="">All degree levels</option>
          {DEGREE_LEVELS.map((d) => (
            <option key={d} value={d}>
              {labelize(d)}
            </option>
          ))}
        </select>
        <button type="submit" className={`${ui.btnPrimary} sm:col-span-4`}>
          Search
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
        {opportunities.length === 0 && (
          <p className={`${ui.muted} sm:col-span-3`}>No opportunities match your search.</p>
        )}
      </div>
    </div>
  );
}
