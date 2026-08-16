import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import { uploadDocumentAction } from "@/lib/actions/document-actions";
import { submitApplicationAction, addStudentMessageAction } from "@/lib/actions/application-actions";
import { payNowAction } from "@/lib/actions/payment-actions";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import { formatMoney } from "@/lib/money";
import {
  APPLICATION_STATUS_STUDENT_LABEL,
  type ApplicationStatus,
  labelize,
} from "@/lib/enums";

export default async function StudentApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireStudent();

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      opportunity: {
        include: { programme: { include: { university: true } }, documentRequirements: true },
      },
      tasks: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "desc" } },
      documents: { include: { versions: { orderBy: { versionNumber: "desc" } } } },
      notes: { where: { type: "STUDENT_MESSAGE" }, orderBy: { createdAt: "asc" }, include: { author: true } },
      assignedAdviser: true,
      invoices: { orderBy: { createdAt: "desc" } },
      payments: { where: { status: "SUCCESSFUL" }, orderBy: { paidAt: "desc" } },
    },
  });
  if (!application || application.studentId !== profile.id) notFound();

  const eligibility = application.eligibilitySnapshot ? JSON.parse(application.eligibilitySnapshot) : null;
  const boundUpload = uploadDocumentAction.bind(null, application.id);
  const outstandingInvoice = application.invoices.find((inv) => inv.status === "UNPAID");
  const documentsUnlocked = !["DRAFT", "PAYMENT_REQUIRED", "PAYMENT_CONFIRMED"].includes(application.status);

  return (
    <div>
      <Link href="/app/applications" className={ui.muted}>
        &larr; My applications
      </Link>

      <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400">{application.applicationNumber}</p>
          <h1 className={ui.pageHeading}>{application.opportunity.title}</h1>
          <p className={ui.muted}>{application.opportunity.programme.university.name}</p>
        </div>
        <StatusBadge status={application.status} label={APPLICATION_STATUS_STUDENT_LABEL[application.status as ApplicationStatus]} />
      </div>

      {application.status === "PAYMENT_REQUIRED" && outstandingInvoice && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div>
            <p className="text-sm font-medium text-amber-900">
              Pay the administration fee to unlock your document checklist.
            </p>
            <p className="mt-1 text-sm text-amber-800">
              {outstandingInvoice.description} — {formatMoney(outstandingInvoice.amount, outstandingInvoice.currency)}
            </p>
          </div>
          <form action={payNowAction.bind(null, application.id)}>
            <button type="submit" className={ui.btnPrimary}>
              Pay now
            </button>
          </form>
        </div>
      )}

      {application.payments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {application.payments.map((p) => (
            <Link
              key={p.id}
              href={`/app/payments/${p.id}/receipt`}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View receipt — {formatMoney(p.amount, p.currency)} paid {new Date(p.paidAt!).toLocaleDateString()}
            </Link>
          ))}
        </div>
      )}

      {application.status === "READY_FOR_SUBMISSION" && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-800">All documents are approved. You&apos;re ready to submit!</p>
          <form action={submitApplicationAction.bind(null, application.id)}>
            <button type="submit" className={ui.btnPrimary}>
              Submit application
            </button>
          </form>
        </div>
      )}
      {application.status === "CORRECTION_REQUIRED" && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          One or more documents need your attention — see below.
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section>
            <h2 className={ui.sectionHeading}>Tasks</h2>
            <div className="mt-3 flex flex-col gap-2">
              {application.tasks.map((t) => (
                <div key={t.id} className={`${ui.card} flex items-center justify-between py-3`}>
                  <div>
                    <p className={`text-sm font-medium ${t.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-900"}`}>
                      {t.title}
                    </p>
                    {t.description && <p className="text-xs text-slate-500">{t.description}</p>}
                  </div>
                  <span className="text-xs">{t.status === "COMPLETED" ? "✅" : "⬜"}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className={ui.sectionHeading}>Documents</h2>
            {!documentsUnlocked ? (
              <p className={`${ui.muted} mt-3`}>Complete your payment above to unlock the document checklist.</p>
            ) : (
            <div className="mt-3 flex flex-col gap-4">
              {application.opportunity.documentRequirements.map((dr) => {
                const doc = application.documents.find((d) => d.documentType === dr.documentType);
                const current = doc?.versions[0];
                return (
                  <div key={dr.id} className={ui.card}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {labelize(dr.documentType)}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            {dr.required ? "Required" : "Optional"}
                          </span>
                        </p>
                        {current && (
                          <p className="text-xs text-slate-500">
                            {current.fileName} - v{current.versionNumber}
                            {current.reviewComment ? ` - "${current.reviewComment}"` : ""}
                          </p>
                        )}
                      </div>
                      {current && <StatusBadge status={current.status} />}
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      {current && (
                        <a
                          href={`/api/documents/${current.id}/download`}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Download current file
                        </a>
                      )}
                    </div>

                    <form action={boundUpload} className="mt-3 flex items-center gap-3">
                      <input type="hidden" name="documentType" value={dr.documentType} />
                      <input
                        type="file"
                        name="file"
                        required
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="text-xs text-slate-600"
                      />
                      <button type="submit" className={ui.btnGhost}>
                        {current ? "Upload new version" : "Upload"}
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
            )}
          </section>

          <section>
            <h2 className={ui.sectionHeading}>Messages</h2>
            <div className="mt-3 flex flex-col gap-2">
              {application.notes.map((n) => (
                <div key={n.id} className={`${ui.card} py-3`}>
                  <p className="text-xs text-slate-400">
                    {n.author ? `${n.author.firstName} ${n.author.lastName}` : "System"} -{" "}
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{n.content}</p>
                </div>
              ))}
              {application.notes.length === 0 && <p className={ui.muted}>No messages yet.</p>}
            </div>
            <form action={addStudentMessageAction.bind(null, application.id)} className="mt-3 flex gap-2">
              <input className={ui.input} name="content" placeholder="Message your adviser..." required />
              <button type="submit" className={ui.btnSecondary}>
                Send
              </button>
            </form>
          </section>
        </div>

        <aside>
          <h2 className={ui.sectionHeading}>Timeline</h2>
          <ol className="mt-3 flex flex-col gap-4 border-l border-slate-200 pl-4">
            {application.events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <p className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}</p>
                <p className="text-sm text-slate-700">{e.message}</p>
              </li>
            ))}
          </ol>

          {eligibility && (
            <div className="mt-6">
              <h2 className={ui.sectionHeading}>Eligibility at application</h2>
              <div className="mt-3">
                <StatusBadge status={eligibility.result} />
              </div>
            </div>
          )}

          {application.assignedAdviser && (
            <div className="mt-6">
              <h2 className={ui.sectionHeading}>Your adviser</h2>
              <p className={`${ui.muted} mt-2`}>
                {application.assignedAdviser.firstName} {application.assignedAdviser.lastName}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
