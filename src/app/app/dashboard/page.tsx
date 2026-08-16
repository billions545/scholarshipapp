import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { computeProfileCompleteness } from "@/lib/services/student-service";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import { APPLICATION_STATUS_STUDENT_LABEL, type ApplicationStatus } from "@/lib/enums";

export default async function StudentDashboardPage() {
  const { user, profile } = await requireStudent();

  const [full, applications] = await Promise.all([
    prisma.studentProfile.findUniqueOrThrow({
      where: { id: profile.id },
      include: { academicRecords: true },
    }),
    prisma.application.findMany({
      where: { studentId: profile.id },
      include: {
        opportunity: { include: { programme: { include: { university: true } } } },
        tasks: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const completeness = computeProfileCompleteness(full);
  const current = applications[0];
  const nextTask = current?.tasks.find((t) => t.status !== "COMPLETED");

  return (
    <div>
      <h1 className={ui.pageHeading}>Welcome back, {user.name?.split(" ")[0] ?? "there"}.</h1>

      {completeness.percent < 100 && (
        <div className={`${ui.card} mt-6`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Profile completeness</p>
            <p className="text-sm font-semibold text-indigo-600">{completeness.percent}%</p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${completeness.percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Missing: {completeness.missing.join(", ")}</p>
          <Link href="/app/profile" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Complete your profile &rarr;
          </Link>
        </div>
      )}

      {current ? (
        <div className={`${ui.card} mt-6`}>
          <p className="text-xs text-slate-400">Current application</p>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{current.opportunity.title}</h2>
              <p className={ui.muted}>{current.opportunity.programme.university.name}</p>
            </div>
            <StatusBadge
              status={current.status}
              label={APPLICATION_STATUS_STUDENT_LABEL[current.status as ApplicationStatus]}
            />
          </div>

          {nextTask ? (
            <p className="mt-4 text-sm text-slate-700">
              <span className="font-medium">Your next task:</span> {nextTask.title}
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-700">No outstanding tasks right now.</p>
          )}

          <Link href={`/app/applications/${current.id}`} className={`${ui.btnPrimary} mt-4 inline-flex`}>
            Continue application
          </Link>
        </div>
      ) : (
        <div className={`${ui.card} mt-6`}>
          <p className="text-slate-700">You haven&apos;t started an application yet.</p>
          <Link href="/opportunities" className={`${ui.btnPrimary} mt-3 inline-flex`}>
            Find opportunities
          </Link>
        </div>
      )}

      {applications.length > 1 && (
        <div className="mt-8">
          <h2 className={ui.sectionHeading}>All applications</h2>
          <div className="mt-3 flex flex-col gap-2">
            {applications.map((app) => (
              <Link key={app.id} href={`/app/applications/${app.id}`} className={`${ui.card} flex items-center justify-between py-3 hover:border-indigo-300`}>
                <p className="text-sm font-medium text-slate-900">{app.opportunity.title}</p>
                <StatusBadge status={app.status} label={APPLICATION_STATUS_STUDENT_LABEL[app.status as ApplicationStatus]} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
