import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ui } from "@/lib/ui";
import type { ApplicationStatus } from "@/lib/enums";

// Kanban-lite application board (PRD §121).
const COLUMNS: { title: string; statuses: ApplicationStatus[] }[] = [
  { title: "New", statuses: ["DRAFT", "DOCUMENTS_REQUIRED"] },
  { title: "Documents", statuses: ["DOCUMENT_REVIEW", "CORRECTION_REQUIRED"] },
  { title: "Payment", statuses: ["PAYMENT_REQUIRED", "PAYMENT_CONFIRMED"] },
  { title: "Ready", statuses: ["READY_FOR_SUBMISSION"] },
  { title: "Submitted", statuses: ["SUBMITTED"] },
  { title: "Partner review", statuses: ["PARTNER_REVIEW"] },
  { title: "Decision", statuses: ["ADMISSION_DECISION", "OFFER_RECEIVED", "OFFER_ACCEPTED"] },
  { title: "Enrolled", statuses: ["ENROLMENT_PENDING", "ENROLLED"] },
  { title: "Closed", statuses: ["REJECTED", "WITHDRAWN", "CANCELLED"] },
];

export default async function AdminApplicationsBoard() {
  const applications = await prisma.application.findMany({
    include: {
      student: { include: { user: true } },
      opportunity: { include: { programme: { include: { university: true } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className={ui.pageHeading}>Applications</h1>
      <p className={`${ui.muted} mt-1`}>{applications.length} total applications.</p>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const items = applications.filter((a) => col.statuses.includes(a.status as ApplicationStatus));
          return (
            <div key={col.title} className="w-72 flex-shrink-0">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-700">{col.title}</h2>
                <span className="text-xs text-slate-400">{items.length}</span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {items.map((app) => (
                  <Link
                    key={app.id}
                    href={`/admin/applications/${app.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-indigo-300"
                  >
                    <p className="font-medium text-slate-900">
                      {app.student.user.firstName} {app.student.user.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{app.opportunity.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{app.opportunity.programme.university.name}</p>
                  </Link>
                ))}
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-300">
                    Empty
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
