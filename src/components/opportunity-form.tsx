import { ui } from "@/lib/ui";
import { OPPORTUNITY_TYPES, OPPORTUNITY_CATEGORIES, labelize } from "@/lib/enums";

type ProgrammeOption = { id: string; name: string; universityName: string };

type Defaults = {
  programmeId?: string;
  title?: string;
  type?: string;
  category?: string | null;
  country?: string | null;
  city?: string | null;
  description?: string | null;
  benefits?: string | null;
  applicationProcessDescription?: string | null;
  tuitionAmount?: number | null;
  applicationFeeAmount?: number | null;
  scholarshipAmount?: number | null;
  scholarshipPercentage?: number | null;
  serviceFeeAmount?: number | null;
  languageRequirement?: string | null;
  deadline?: Date | null;
  intake?: string | null;
  estimatedProcessingDays?: number | null;
};

export function OpportunityForm({
  action,
  programmes,
  defaults,
  submitLabel,
  lockProgramme,
}: {
  action: (formData: FormData) => void;
  programmes: ProgrammeOption[];
  defaults?: Defaults;
  submitLabel: string;
  lockProgramme?: boolean;
}) {
  const d = defaults ?? {};
  const deadlineValue = d.deadline ? new Date(d.deadline).toISOString().slice(0, 10) : "";

  return (
    <form action={action} className={`${ui.card} flex flex-col gap-4`}>
      <div>
        <label className={ui.label}>Programme</label>
        <select className={ui.input} name="programmeId" required defaultValue={d.programmeId} disabled={lockProgramme}>
          <option value="" disabled>
            Select a programme
          </option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.universityName} - {p.name}
            </option>
          ))}
        </select>
        {lockProgramme && d.programmeId && (
          <input type="hidden" name="programmeId" value={d.programmeId} />
        )}
      </div>

      <div>
        <label className={ui.label}>Title</label>
        <input className={ui.input} name="title" required defaultValue={d.title} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={ui.label}>Opportunity type</label>
          <select className={ui.input} name="type" required defaultValue={d.type}>
            {OPPORTUNITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {labelize(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={ui.label}>Category</label>
          <select className={ui.input} name="category" defaultValue={d.category ?? ""}>
            <option value="">None</option>
            {OPPORTUNITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {labelize(c)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={ui.label}>Country</label>
          <input className={ui.input} name="country" defaultValue={d.country ?? ""} />
        </div>
        <div>
          <label className={ui.label}>City</label>
          <input className={ui.input} name="city" defaultValue={d.city ?? ""} />
        </div>
      </div>

      <div>
        <label className={ui.label}>Description</label>
        <textarea className={ui.input} name="description" rows={4} defaultValue={d.description ?? ""} />
      </div>
      <div>
        <label className={ui.label}>Benefits</label>
        <textarea className={ui.input} name="benefits" rows={3} defaultValue={d.benefits ?? ""} />
      </div>
      <div>
        <label className={ui.label}>Application process</label>
        <textarea
          className={ui.input}
          name="applicationProcessDescription"
          rows={3}
          defaultValue={d.applicationProcessDescription ?? ""}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={ui.label}>Tuition (NGN minor units)</label>
          <input className={ui.input} name="tuitionAmount" type="number" defaultValue={d.tuitionAmount ?? ""} />
        </div>
        <div>
          <label className={ui.label}>Application fee (NGN minor units)</label>
          <input
            className={ui.input}
            name="applicationFeeAmount"
            type="number"
            defaultValue={d.applicationFeeAmount ?? ""}
          />
        </div>
        <div>
          <label className={ui.label}>Scholarship amount (NGN minor units)</label>
          <input
            className={ui.input}
            name="scholarshipAmount"
            type="number"
            defaultValue={d.scholarshipAmount ?? ""}
          />
        </div>
        <div>
          <label className={ui.label}>Scholarship percentage</label>
          <input
            className={ui.input}
            name="scholarshipPercentage"
            type="number"
            min={0}
            max={100}
            defaultValue={d.scholarshipPercentage ?? ""}
          />
        </div>
        <div>
          <label className={ui.label}>Agency service fee (NGN minor units)</label>
          <input
            className={ui.input}
            name="serviceFeeAmount"
            type="number"
            defaultValue={d.serviceFeeAmount ?? ""}
          />
        </div>
        <div>
          <label className={ui.label}>Language requirement</label>
          <input
            className={ui.input}
            name="languageRequirement"
            defaultValue={d.languageRequirement ?? ""}
            placeholder="IELTS 6.5+"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={ui.label}>Application deadline</label>
          <input className={ui.input} name="deadline" type="date" defaultValue={deadlineValue} />
        </div>
        <div>
          <label className={ui.label}>Intake</label>
          <input className={ui.input} name="intake" defaultValue={d.intake ?? ""} placeholder="Fall 2026" />
        </div>
        <div>
          <label className={ui.label}>Est. processing (days)</label>
          <input
            className={ui.input}
            name="estimatedProcessingDays"
            type="number"
            defaultValue={d.estimatedProcessingDays ?? ""}
          />
        </div>
      </div>

      <button type="submit" className={`${ui.btnPrimary} self-start`}>
        {submitLabel}
      </button>
    </form>
  );
}
