import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ui } from "@/lib/ui";

export default async function AdminStudentsPage() {
  const students = await prisma.studentProfile.findMany({
    include: {
      user: true,
      assignedAdviser: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className={ui.pageHeading}>Students</h1>
      <p className={`${ui.muted} mt-1`}>{students.length} registered students.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Applications</th>
              <th className="px-4 py-3">Adviser</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {s.user.firstName} {s.user.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600">{s.user.email}</td>
                <td className="px-4 py-3 text-slate-600">{s.countryOfResidence ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{s._count.applications}</td>
                <td className="px-4 py-3 text-slate-600">
                  {s.assignedAdviser ? `${s.assignedAdviser.firstName} ${s.assignedAdviser.lastName}` : "Unassigned"}
                </td>
                <td className="px-4 py-3 text-slate-600">{s.acquisitionSource ?? "-"}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
