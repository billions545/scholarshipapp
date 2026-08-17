import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";

export default async function AdminDashboardPage() {
  const [
    studentCount,
    activeApplications,
    submittedCount,
    admittedCount,
    enrolledCount,
    recentApplications,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.application.count({ where: { status: { notIn: ["ENROLLED", "REJECTED", "WITHDRAWN", "CANCELLED"] } } }),
    prisma.application.count({
      where: {
        status: {
          notIn: [
            "DRAFT",
            "DOCUMENTS_REQUIRED",
            "DOCUMENT_REVIEW",
            "CORRECTION_REQUIRED",
            "PAYMENT_REQUIRED",
            "PAYMENT_CONFIRMED",
            "READY_FOR_SUBMISSION",
          ],
        },
      },
    }),
    prisma.application.count({ where: { status: { in: ["OFFER_RECEIVED", "OFFER_ACCEPTED", "ENROLMENT_PENDING", "ENROLLED"] } } }),
    prisma.application.count({ where: { status: "ENROLLED" } }),
    prisma.application.findMany({
      take: 8,
      orderBy: { updatedAt: "desc" },
      include: {
        student: { include: { user: true } },
        opportunity: { include: { programme: { include: { university: true } } } },
      },
    }),
  ]);

  const stats = [
    ["Students", studentCount],
    ["Active applications", activeApplications],
    ["Submitted", submittedCount],
    ["Admitted or better", admittedCount],
    ["Enrolled", enrolledCount],
  ] as const;

  return (
    <div>
      <h1 className={ui.pageHeading}>Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className={ui.card}>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className={`${ui.muted} mt-1`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className={ui.sectionHeading}>Recent activity</h2>
        <Link href="/admin/applications" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          View all applications &rarr;
        </Link>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Opportunity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {recentApplications.map((app) => (
              <tr key={app.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/applications/${app.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                    {app.student.user.firstName} {app.student.user.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{app.opportunity.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(app.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {recentApplications.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
