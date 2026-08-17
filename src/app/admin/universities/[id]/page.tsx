import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createProgrammeAction } from "@/lib/actions/catalog-actions";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";
import { DEGREE_LEVELS, STUDY_MODES, labelize } from "@/lib/enums";

export default async function UniversityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const university = await prisma.university.findUnique({
    where: { id },
    include: { partner: true, programmes: { include: { opportunities: true } } },
  });
  if (!university) notFound();

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Link href={`/admin/partners/${university.partnerId}`} className={ui.muted}>
          &larr; {university.partner.name}
        </Link>
        <h1 className={`${ui.pageHeading} mt-1`}>{university.name}</h1>
        <p className={ui.muted}>
          {university.city ? `${university.city}, ` : ""}
          {university.country}
        </p>

        <h2 className={`${ui.sectionHeading} mt-8`}>Programmes</h2>
        <div className="mt-3 flex flex-col gap-3">
          {university.programmes.length === 0 && (
            <p className={ui.muted}>No programmes yet.</p>
          )}
          {university.programmes.map((p) => (
            <Link key={p.id} href={`/admin/programmes/${p.id}`} className={`${ui.card} block hover:border-indigo-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className={ui.muted}>
                    {labelize(p.degreeLevel)} {p.fieldOfStudy ? `- ${p.fieldOfStudy}` : ""}
                  </p>
                </div>
                <p className={ui.muted}>{p.opportunities.length} opportunities</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className={ui.sectionHeading}>Add programme</h2>
        <form action={createProgrammeAction} className={`${ui.card} mt-3 flex flex-col gap-3`}>
          <input type="hidden" name="universityId" value={university.id} />
          <div>
            <label className={ui.label}>Name</label>
            <input className={ui.input} name="name" required placeholder="MSc Computer Science" />
          </div>
          <div>
            <label className={ui.label}>Degree level</label>
            <select className={ui.input} name="degreeLevel" required>
              {DEGREE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {labelize(l)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={ui.label}>Field of study</label>
            <input className={ui.input} name="fieldOfStudy" />
          </div>
          <div>
            <label className={ui.label}>Study mode</label>
            <select className={ui.input} name="studyMode">
              {STUDY_MODES.map((m) => (
                <option key={m} value={m}>
                  {labelize(m)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={ui.label}>Duration (months)</label>
            <input className={ui.input} name="durationMonths" type="number" min={1} />
          </div>
          <SubmitButton pendingText="Adding...">Add programme</SubmitButton>
        </form>
      </div>
    </div>
  );
}
