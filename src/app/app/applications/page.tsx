import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import { APPLICATION_STATUS_STUDENT_LABEL, type ApplicationStatus } from "@/lib/enums";

export default async function MyApplicationsPage() {
  const { profile } = await requireStudent();
  const applications = await prisma.application.findMany({
    where: { studentId: profile.id },
    include: { opportunity: { include: { programme: { include: { university: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={ui.pageHeading}>My applications</h1>
        <Link href="/opportunities" className={ui.btnPrimary}>
          Browse opportunities
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {applications.map((app) => (
          <Link key={app.id} href={`/app/applications/${app.id}`} className={`${ui.card} block hover:border-indigo-300`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">{app.applicationNumber}</p>
                <p className="font-semibold text-slate-900">{app.opportunity.title}</p>
                <p className={ui.muted}>{app.opportunity.programme.university.name}</p>
              </div>
              <StatusBadge status={app.status} label={APPLICATION_STATUS_STUDENT_LABEL[app.status as ApplicationStatus]} />
            </div>
          </Link>
        ))}
        {applications.length === 0 && (
          <p className={ui.muted}>You haven&apos;t started any applications yet.</p>
        )}
      </div>
    </div>
  );
}
