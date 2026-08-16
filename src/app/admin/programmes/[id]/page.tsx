import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import { labelize } from "@/lib/enums";

export default async function ProgrammeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const programme = await prisma.programme.findUnique({
    where: { id },
    include: { university: { include: { partner: true } }, opportunities: true },
  });
  if (!programme) notFound();

  return (
    <div>
      <Link href={`/admin/universities/${programme.universityId}`} className={ui.muted}>
        &larr; {programme.university.name}
      </Link>
      <div className="mt-1 flex items-center justify-between">
        <div>
          <h1 className={ui.pageHeading}>{programme.name}</h1>
          <p className={ui.muted}>
            {labelize(programme.degreeLevel)} {programme.fieldOfStudy ? `- ${programme.fieldOfStudy}` : ""} at{" "}
            {programme.university.name}
          </p>
        </div>
        <Link href={`/admin/opportunities/new?programmeId=${programme.id}`} className={ui.btnPrimary}>
          + New opportunity
        </Link>
      </div>

      <h2 className={`${ui.sectionHeading} mt-8`}>Opportunities</h2>
      <div className="mt-3 flex flex-col gap-3">
        {programme.opportunities.length === 0 && (
          <p className={ui.muted}>No opportunities under this programme yet.</p>
        )}
        {programme.opportunities.map((o) => (
          <Link key={o.id} href={`/admin/opportunities/${o.id}`} className={`${ui.card} block hover:border-indigo-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{o.title}</p>
                <p className={ui.muted}>{labelize(o.type)}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
