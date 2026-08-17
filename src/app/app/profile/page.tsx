import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/session";
import {
  updateProfileAction,
  addAcademicRecordAction,
  removeAcademicRecordAction,
  addWorkExperienceAction,
  removeWorkExperienceAction,
} from "@/lib/actions/student-actions";
import { ui } from "@/lib/ui";
import { SubmitButton } from "@/components/submit-button";
import { DEGREE_LEVELS, labelize } from "@/lib/enums";

function fmtDate(d: Date | null): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default async function ProfilePage() {
  const { profile } = await requireStudent();
  const full = await prisma.studentProfile.findUniqueOrThrow({
    where: { id: profile.id },
    include: { academicRecords: { orderBy: { createdAt: "desc" } }, workExperiences: { orderBy: { createdAt: "desc" } } },
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className={ui.pageHeading}>My profile</h1>
        <p className={`${ui.muted} mt-1`}>
          Keep this up to date — it&apos;s what your eligibility checks and applications are based on.
        </p>
      </div>

      <section>
        <h2 className={ui.sectionHeading}>Personal information</h2>
        <form action={updateProfileAction} className={`${ui.card} mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2`}>
          <div>
            <label className={ui.label}>Date of birth</label>
            <input className={ui.input} name="dateOfBirth" type="date" defaultValue={fmtDate(full.dateOfBirth)} />
          </div>
          <div>
            <label className={ui.label}>Gender</label>
            <input className={ui.input} name="gender" defaultValue={full.gender ?? ""} />
          </div>
          <div>
            <label className={ui.label}>Nationality</label>
            <input className={ui.input} name="nationality" defaultValue={full.nationality ?? ""} placeholder="Nigerian" />
          </div>
          <div>
            <label className={ui.label}>Country of residence</label>
            <input className={ui.input} name="countryOfResidence" defaultValue={full.countryOfResidence ?? ""} />
          </div>
          <div>
            <label className={ui.label}>State / region</label>
            <input className={ui.input} name="state" defaultValue={full.state ?? ""} />
          </div>
          <div>
            <label className={ui.label}>Preferred contact method</label>
            <select className={ui.input} name="preferredContact" defaultValue={full.preferredContact ?? "EMAIL"}>
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={ui.label}>Address</label>
            <input className={ui.input} name="address" defaultValue={full.address ?? ""} />
          </div>
          <div>
            <label className={ui.label}>Passport number</label>
            <input className={ui.input} name="passportNumber" defaultValue={full.passportNumber ?? ""} />
          </div>
          <div>
            <label className={ui.label}>Passport expiry</label>
            <input className={ui.input} name="passportExpiry" type="date" defaultValue={fmtDate(full.passportExpiry)} />
          </div>

          <div className="sm:col-span-2 mt-2 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700">Study preferences</p>
          </div>
          <div>
            <label className={ui.label}>Preferred country</label>
            <input className={ui.input} name="preferredCountry" defaultValue={full.preferredCountry ?? ""} />
          </div>
          <div>
            <label className={ui.label}>Preferred degree level</label>
            <select className={ui.input} name="preferredDegreeLevel" defaultValue={full.preferredDegreeLevel ?? ""}>
              <option value="">No preference</option>
              {DEGREE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {labelize(l)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={ui.label}>Preferred field of study</label>
            <input className={ui.input} name="preferredField" defaultValue={full.preferredField ?? ""} />
          </div>
          <div>
            <label className={ui.label}>Preferred intake</label>
            <input className={ui.input} name="preferredIntake" defaultValue={full.preferredIntake ?? ""} placeholder="Fall 2026" />
          </div>
          <div>
            <label className={ui.label}>Budget (NGN)</label>
            <input className={ui.input} name="budget" type="number" defaultValue={full.budget ?? ""} />
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
            <input type="checkbox" name="willingToRelocate" defaultChecked={full.willingToRelocate ?? false} className="rounded border-slate-300" />
            Willing to relocate
          </label>

          <div className="sm:col-span-2">
            <SubmitButton pendingText="Saving...">Save profile</SubmitButton>
          </div>
        </form>
      </section>

      <section>
        <h2 className={ui.sectionHeading}>Academic records</h2>
        <div className="mt-3 flex flex-col gap-2">
          {full.academicRecords.map((rec) => (
            <div key={rec.id} className={`${ui.card} flex items-center justify-between py-3`}>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {labelize(rec.level)} - {rec.institution}
                </p>
                <p className="text-xs text-slate-500">
                  {rec.programme ?? rec.fieldOfStudy ?? ""} {rec.gpa ? `- GPA ${rec.gpa}` : ""}
                </p>
              </div>
              <form action={removeAcademicRecordAction.bind(null, rec.id)}>
                <SubmitButton variant="custom" pendingText="Removing..." className="text-xs font-medium text-red-600 hover:text-red-700">
                  Remove
                </SubmitButton>
              </form>
            </div>
          ))}
          {full.academicRecords.length === 0 && <p className={ui.muted}>No academic records yet.</p>}
        </div>

        <form action={addAcademicRecordAction} className={`${ui.card} mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2`}>
          <div>
            <label className={ui.label}>Qualification level</label>
            <select className={ui.input} name="level" required>
              {DEGREE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {labelize(l)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={ui.label}>Institution</label>
            <input className={ui.input} name="institution" required />
          </div>
          <div>
            <label className={ui.label}>Programme</label>
            <input className={ui.input} name="programme" />
          </div>
          <div>
            <label className={ui.label}>Field of study</label>
            <input className={ui.input} name="fieldOfStudy" />
          </div>
          <div>
            <label className={ui.label}>Graduation date</label>
            <input className={ui.input} name="graduationDate" type="date" />
          </div>
          <div>
            <label className={ui.label}>GPA</label>
            <input className={ui.input} name="gpa" type="number" step="0.01" />
          </div>
          <div>
            <label className={ui.label}>Grading scale</label>
            <input className={ui.input} name="gradingScale" placeholder="4.0 / 5.0" />
          </div>
          <div>
            <label className={ui.label}>Class / division</label>
            <input className={ui.input} name="classDivision" placeholder="First Class" />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton variant="secondary" pendingText="Adding...">Add academic record</SubmitButton>
          </div>
        </form>
      </section>

      <section>
        <h2 className={ui.sectionHeading}>Work experience</h2>
        <div className="mt-3 flex flex-col gap-2">
          {full.workExperiences.map((w) => (
            <div key={w.id} className={`${ui.card} flex items-center justify-between py-3`}>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {w.position} at {w.employer}
                </p>
                <p className="text-xs text-slate-500">{w.industry}</p>
              </div>
              <form action={removeWorkExperienceAction.bind(null, w.id)}>
                <SubmitButton variant="custom" pendingText="Removing..." className="text-xs font-medium text-red-600 hover:text-red-700">
                  Remove
                </SubmitButton>
              </form>
            </div>
          ))}
          {full.workExperiences.length === 0 && <p className={ui.muted}>No work experience added yet.</p>}
        </div>

        <form action={addWorkExperienceAction} className={`${ui.card} mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2`}>
          <div>
            <label className={ui.label}>Employer</label>
            <input className={ui.input} name="employer" required />
          </div>
          <div>
            <label className={ui.label}>Position</label>
            <input className={ui.input} name="position" required />
          </div>
          <div>
            <label className={ui.label}>Start date</label>
            <input className={ui.input} name="startDate" type="date" />
          </div>
          <div>
            <label className={ui.label}>End date</label>
            <input className={ui.input} name="endDate" type="date" />
          </div>
          <div>
            <label className={ui.label}>Industry</label>
            <input className={ui.input} name="industry" />
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
            <input type="checkbox" name="isCurrent" className="rounded border-slate-300" />
            Current role
          </label>
          <div className="sm:col-span-2">
            <label className={ui.label}>Description</label>
            <textarea className={ui.input} name="description" rows={2} />
          </div>
          <div className="sm:col-span-2">
            <SubmitButton variant="secondary" pendingText="Adding...">Add work experience</SubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}
