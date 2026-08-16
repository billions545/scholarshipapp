import { requireAgent } from "@/lib/session";
import { getAgentDashboardData } from "@/lib/services/agent-service";
import { StatusBadge } from "@/components/status-badge";
import { ui } from "@/lib/ui";
import { APPLICATION_STATUS_STUDENT_LABEL, type ApplicationStatus } from "@/lib/enums";

export default async function AgentStudentsPage() {
  const user = await requireAgent();
  const { students } = await getAgentDashboardData(user.id);

  return (
    <div>
      <h1 className={ui.pageHeading}>My students</h1>
      <p className={`${ui.muted} mt-1`}>Students who registered through your referral link.</p>

      <div className="mt-6 flex flex-col gap-3">
        {students.map((s) => (
          <div key={s.id} className={ui.card}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {s.user.firstName} {s.user.lastName}
                </p>
                <p className={ui.muted}>{s.countryOfResidence ?? "Country not set"}</p>
              </div>
              <p className="text-xs text-slate-400">
                Joined {new Date(s.createdAt).toLocaleDateString()}
              </p>
            </div>
            {s.applications.length > 0 ? (
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                {s.applications.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{a.opportunity.title}</span>
                    <StatusBadge
                      status={a.status}
                      label={APPLICATION_STATUS_STUDENT_LABEL[a.status as ApplicationStatus]}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">No applications yet.</p>
            )}
          </div>
        ))}
        {students.length === 0 && (
          <p className={ui.muted}>No students yet — share your referral link to get started.</p>
        )}
      </div>
    </div>
  );
}
