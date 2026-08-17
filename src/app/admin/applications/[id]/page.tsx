import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  transitionStatusAction,
  assignAdviserAction,
  addInternalNoteAction,
  addStudentMessageAction,
  staffSubmitApplicationAction,
} from "@/lib/actions/application-actions";
import { reviewDocumentAction } from "@/lib/actions/document-actions";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";
import { availableStaffTransitions } from "@/lib/application-workflow";
import { requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { type ApplicationStatus, labelize } from "@/lib/enums";

export default async function AdminApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await requireStaff();
  const canUpdate = hasPermission(currentUser.role, "application.update");
  const canSubmit = hasPermission(currentUser.role, "application.submit");
  const canReviewDocuments = hasPermission(currentUser.role, "document.review");

  const [application, advisers] = await Promise.all([
    prisma.application.findUnique({
      where: { id },
      include: {
        student: { include: { user: true, academicRecords: true } },
        opportunity: { include: { programme: { include: { university: true } }, documentRequirements: true } },
        tasks: { orderBy: { createdAt: "asc" } },
        events: { orderBy: { createdAt: "desc" } },
        documents: { include: { versions: { orderBy: { versionNumber: "desc" } } } },
        notes: { orderBy: { createdAt: "asc" }, include: { author: true } },
        assignedAdviser: true,
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMISSIONS_OFFICER", "ADMISSIONS_MANAGER", "ADMIN", "SUPER_ADMIN"] } },
      orderBy: { firstName: "asc" },
    }),
  ]);
  if (!application) notFound();

  const eligibility = application.eligibilitySnapshot ? JSON.parse(application.eligibilitySnapshot) : null;
  const nextStatuses = availableStaffTransitions(application.status as ApplicationStatus);
  const boundTransition = transitionStatusAction.bind(null, application.id);
  const boundAssign = assignAdviserAction.bind(null, application.id);
  const boundInternalNote = addInternalNoteAction.bind(null, application.id);
  const boundMessage = addStudentMessageAction.bind(null, application.id);

  return (
    <div>
      <Link href="/admin/applications" className={ui.muted}>
        &larr; Applications
      </Link>

      <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400">{application.applicationNumber}</p>
          <h1 className={ui.pageHeading}>
            {application.student.user.firstName} {application.student.user.lastName}
          </h1>
          <p className={ui.muted}>
            {application.opportunity.title} - {application.opportunity.programme.university.name}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <section className={ui.card}>
            <h2 className={ui.sectionHeading}>Status</h2>
            {canUpdate ? (
              <div className="mt-3 flex flex-wrap items-end gap-4">
                <form action={boundTransition} className="flex items-end gap-2">
                  <div>
                    <label className={ui.label}>Move to</label>
                    <select className={ui.input} name="status" defaultValue="">
                      <option value="" disabled>
                        Choose status
                      </option>
                      {nextStatuses.map((s) => (
                        <option key={s} value={s}>
                          {labelize(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <SubmitButton variant="secondary" disabled={nextStatuses.length === 0} pendingText="Updating...">
                    Update
                  </SubmitButton>
                </form>
                {canSubmit && application.status === "READY_FOR_SUBMISSION" && (
                  <form action={staffSubmitApplicationAction.bind(null, application.id)}>
                    <SubmitButton pendingText="Submitting...">Submit on behalf of student</SubmitButton>
                  </form>
                )}
              </div>
            ) : (
              <p className={`${ui.muted} mt-2`}>You don&apos;t have permission to change the status.</p>
            )}

            {canUpdate && (
              <div className="mt-4">
                <label className={ui.label}>Assigned adviser</label>
                <form action={boundAssign} className="flex items-center gap-2">
                  <select className={ui.input} name="adviserId" defaultValue={application.assignedAdviserId ?? ""}>
                    <option value="">Unassigned</option>
                    {advisers.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.firstName} {a.lastName}
                      </option>
                    ))}
                  </select>
                  <SubmitButton variant="secondary" pendingText="Saving...">Save</SubmitButton>
                </form>
              </div>
            )}
          </section>

          <section>
            <h2 className={ui.sectionHeading}>Eligibility</h2>
            {eligibility ? (
              <div className={`${ui.card} mt-3`}>
                <StatusBadge status={eligibility.result} />
                <ul className="mt-3 flex flex-col gap-1 text-sm text-slate-700">
                  {eligibility.evaluations.map((e: { ruleId: string; label: string; met: boolean | null; required: boolean }) => (
                    <li key={e.ruleId}>
                      {e.met === true ? "✅" : e.met === false ? "❌" : "❓"} {e.label}{" "}
                      {!e.required && <span className="text-xs text-slate-400">(informational)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={`${ui.muted} mt-2`}>No eligibility snapshot recorded.</p>
            )}
          </section>

          <section>
            <h2 className={ui.sectionHeading}>Documents</h2>
            <div className="mt-3 flex flex-col gap-4">
              {application.opportunity.documentRequirements.map((dr) => {
                const doc = application.documents.find((d) => d.documentType === dr.documentType);
                const current = doc?.versions[0];
                return (
                  <div key={dr.id} className={ui.card}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{labelize(dr.documentType)}</p>
                        {current ? (
                          <p className="text-xs text-slate-500">
                            {current.fileName} - v{current.versionNumber} - uploaded{" "}
                            {new Date(current.uploadedAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400">Not uploaded yet.</p>
                        )}
                      </div>
                      {current && <StatusBadge status={current.status} />}
                    </div>

                    {current && (
                      <div className="mt-3 flex flex-col gap-3">
                        <a
                          href={`/api/documents/${current.id}/download`}
                          className="w-fit text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Download file
                        </a>
                        {canReviewDocuments && (
                          <form action={reviewDocumentAction.bind(null, application.id, current.id)} className="flex flex-wrap items-center gap-2">
                            <input className={`${ui.input} w-64`} name="comment" placeholder="Comment (required for rejection/correction)" />
                            <SubmitButton name="decision" value="APPROVED" pendingText="Approving...">
                              Approve
                            </SubmitButton>
                            <SubmitButton
                              variant="secondary"
                              name="decision"
                              value="CORRECTION_REQUIRED"
                              pendingText="Sending back..."
                            >
                              Request correction
                            </SubmitButton>
                            <SubmitButton variant="danger" name="decision" value="REJECTED" pendingText="Rejecting...">
                              Reject
                            </SubmitButton>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className={ui.sectionHeading}>Internal notes</h2>
            <p className={`${ui.muted} mt-1`}>Only visible to staff.</p>
            <div className="mt-3 flex flex-col gap-2">
              {application.notes
                .filter((n) => n.type === "INTERNAL_NOTE")
                .map((n) => (
                  <div key={n.id} className={`${ui.card} py-3`}>
                    <p className="text-xs text-slate-400">
                      {n.author ? `${n.author.firstName} ${n.author.lastName}` : "System"} -{" "}
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{n.content}</p>
                  </div>
                ))}
            </div>
            <form action={boundInternalNote} className="mt-3 flex gap-2">
              <input className={ui.input} name="content" placeholder="Add an internal note..." required />
              <SubmitButton variant="secondary" pendingText="Adding...">Add note</SubmitButton>
            </form>
          </section>

          <section>
            <h2 className={ui.sectionHeading}>Messages with student</h2>
            <div className="mt-3 flex flex-col gap-2">
              {application.notes
                .filter((n) => n.type === "STUDENT_MESSAGE")
                .map((n) => (
                  <div key={n.id} className={`${ui.card} py-3`}>
                    <p className="text-xs text-slate-400">
                      {n.author ? `${n.author.firstName} ${n.author.lastName}` : "System"} -{" "}
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{n.content}</p>
                  </div>
                ))}
            </div>
            <form action={boundMessage} className="mt-3 flex gap-2">
              <input className={ui.input} name="content" placeholder="Message the student..." required />
              <SubmitButton variant="secondary" pendingText="Sending...">Send</SubmitButton>
            </form>
          </section>
        </div>

        <aside>
          <h2 className={ui.sectionHeading}>Tasks</h2>
          <div className="mt-3 flex flex-col gap-2">
            {application.tasks.map((t) => (
              <div key={t.id} className={`${ui.card} flex items-center justify-between py-2`}>
                <p className={`text-xs ${t.status === "COMPLETED" ? "text-slate-400 line-through" : "text-slate-700"}`}>
                  {t.title}
                </p>
                <span className="text-xs">{t.status === "COMPLETED" ? "✅" : "⬜"}</span>
              </div>
            ))}
          </div>

          <h2 className={`${ui.sectionHeading} mt-8`}>Timeline</h2>
          <ol className="mt-3 flex flex-col gap-4 border-l border-slate-200 pl-4">
            {application.events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <p className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString()}</p>
                <p className="text-sm text-slate-700">{e.message}</p>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
