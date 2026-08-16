import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import { labelize } from "@/lib/enums";

export default async function AdminOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const opportunities = await prisma.opportunity.findMany({
    where: status ? { status } : undefined,
    include: { programme: { include: { university: true } }, _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statuses = ["DRAFT", "REVIEW", "PUBLISHED", "EXPIRED", "ARCHIVED"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={ui.pageHeading}>Opportunities</h1>
          <p className={`${ui.muted} mt-1`}>Manage scholarships, programmes and other opportunities.</p>
        </div>
        <Link href="/admin/partners" className={ui.btnSecondary}>
          Manage catalog
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href="/admin/opportunities" className={!status ? ui.btnPrimary : ui.btnSecondary}>
          All
        </Link>
        {statuses.map((s) => (
          <Link key={s} href={`/admin/opportunities?status=${s}`} className={status === s ? ui.btnPrimary : ui.btnSecondary}>
            {labelize(s)}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">University</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Applications</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/opportunities/${o.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                    {o.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{o.programme.university.name}</td>
                <td className="px-4 py-3 text-slate-600">{labelize(o.type)}</td>
                <td className="px-4 py-3 text-slate-600">{o._count.applications}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
            {opportunities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No opportunities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
