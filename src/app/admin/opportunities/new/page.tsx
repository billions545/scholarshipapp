import { prisma } from "@/lib/prisma";
import { createOpportunityAction } from "@/lib/actions/catalog-actions";
import { OpportunityForm } from "@/components/opportunity-form";
import { ui } from "@/lib/ui";

export default async function NewOpportunityPage({
  searchParams,
}: {
  searchParams: Promise<{ programmeId?: string }>;
}) {
  const { programmeId } = await searchParams;
  const programmes = await prisma.programme.findMany({
    include: { university: true },
    orderBy: { name: "asc" },
  });
  const options = programmes.map((p) => ({ id: p.id, name: p.name, universityName: p.university.name }));

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className={ui.pageHeading}>New opportunity</h1>
      <p className={`${ui.muted} mt-1`}>
        It will be created as a draft. Add eligibility rules and document requirements before publishing.
      </p>
      <div className="mt-6">
        <OpportunityForm
          action={createOpportunityAction}
          programmes={options}
          defaults={{ programmeId }}
          submitLabel="Create draft"
        />
      </div>
    </div>
  );
}
