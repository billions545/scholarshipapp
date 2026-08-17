import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { computeProfileCompleteness } from "@/lib/services/student-service";
import { StatusBadge } from "@/components/status-badge";
import { OpportunityCard } from "@/components/opportunity-card";
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

  const appliedOpportunityIds = applications.map((a) => a.opportunityId);
  const recommended = await prisma.opportunity.findMany({
    where: { status: "PUBLISHED", id: { notIn: appliedOpportunityIds } },
    include: { programme: { include: { university: true } } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const completeness = computeProfileCompleteness(full);
  const current = applications[0];
  const nextTask = current?.tasks.find((t) => t.status !== "COMPLETED");
  const enrolledCount = applications.filter((a) => a.status === "ENROLLED").length;
  const inProgressCount = applications.filter((a) => !["ENROLLED", "REJECTED", "WITHDRAWN", "CANCELLED"].includes(a.status)).length;
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl">
        <Image
          src="/images/graduation-caps.jpg"
          alt=""
          width={1600}
          height={500}
          priority
          className="h-56 w-full object-cover sm:h-64"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-800/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <p className="text-sm font-medium text-indigo-200">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Hey {firstName}, your future is waiting.</h1>
          <p className="mt-2 max-w-md text-sm text-indigo-100">
            {inProgressCount > 0
              ? `You have ${inProgressCount} application${inProgressCount === 1 ? "" : "s"} in motion — keep the momentum going.`
              : "Thousands of students have found their path with us. Yours starts with one application."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/opportunities" className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50">
              Browse opportunities
            </Link>
            {current && (
              <Link href={`/app/applications/${current.id}`} className="inline-flex items-center justify-center rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                Continue application
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Applications", applications.length],
          ["In progress", inProgressCount],
          ["Enrolled", enrolledCount],
          ["Profile", `${completeness.percent}%`],
        ].map(([label, value]) => (
          <div key={label} className={`${ui.card} text-center`}>
            <p className="text-2xl font-bold text-indigo-600">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {completeness.percent < 100 && (
        <div className={`${ui.card} mt-6`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Profile completeness</p>
            <p className="text-sm font-semibold text-indigo-600">{completeness.percent}%</p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${completeness.percent}%` }} />
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

      {recommended.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className={ui.sectionHeading}>Recommended for you</h2>
            <Link href="/opportunities" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              See all &rarr;
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        </div>
      )}

      <div className="relative mt-10 overflow-hidden rounded-2xl">
        <Image
          src="/images/library-students.jpg"
          alt=""
          width={1600}
          height={400}
          className="h-40 w-full object-cover sm:h-48"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 to-slate-900/40" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
          <p className="text-sm font-semibold text-amber-300">Did you know?</p>
          <p className="mt-1 max-w-lg text-base font-medium text-white sm:text-lg">
            Students who complete their profile within the first week are matched to opportunities 3x faster.
          </p>
        </div>
      </div>
    </div>
  );
}
