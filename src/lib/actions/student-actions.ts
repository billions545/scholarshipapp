"use server";

import { revalidatePath } from "next/cache";
import { requireStudent } from "@/lib/session";
import * as studentService from "@/lib/services/student-service";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}
function optStr(formData: FormData, key: string): string | undefined {
  const v = str(formData, key);
  return v.length ? v : undefined;
}

export async function updateProfileAction(formData: FormData) {
  const { profile } = await requireStudent();
  await studentService.updateStudentProfile(profile.id, {
    dateOfBirth: optStr(formData, "dateOfBirth"),
    gender: optStr(formData, "gender"),
    nationality: optStr(formData, "nationality"),
    countryOfResidence: optStr(formData, "countryOfResidence"),
    state: optStr(formData, "state"),
    address: optStr(formData, "address"),
    preferredContact: optStr(formData, "preferredContact"),
    passportNumber: optStr(formData, "passportNumber"),
    passportExpiry: optStr(formData, "passportExpiry"),
    preferredCountry: optStr(formData, "preferredCountry"),
    preferredDegreeLevel: optStr(formData, "preferredDegreeLevel"),
    preferredField: optStr(formData, "preferredField"),
    preferredIntake: optStr(formData, "preferredIntake"),
    budget: formData.get("budget") ? Number(formData.get("budget")) : null,
    willingToRelocate: formData.get("willingToRelocate") === "on",
  });
  revalidatePath("/app/profile");
  revalidatePath("/app/dashboard");
}

export async function addAcademicRecordAction(formData: FormData) {
  const { profile } = await requireStudent();
  await studentService.addAcademicRecord(profile.id, {
    level: str(formData, "level"),
    institution: str(formData, "institution"),
    programme: optStr(formData, "programme"),
    fieldOfStudy: optStr(formData, "fieldOfStudy"),
    graduationDate: optStr(formData, "graduationDate"),
    gpa: formData.get("gpa") ? Number(formData.get("gpa")) : null,
    gradingScale: optStr(formData, "gradingScale"),
    classDivision: optStr(formData, "classDivision"),
  });
  revalidatePath("/app/profile");
  revalidatePath("/app/dashboard");
}

export async function removeAcademicRecordAction(id: string) {
  await requireStudent();
  await studentService.removeAcademicRecord(id);
  revalidatePath("/app/profile");
}

export async function addWorkExperienceAction(formData: FormData) {
  const { profile } = await requireStudent();
  await studentService.addWorkExperience(profile.id, {
    employer: str(formData, "employer"),
    position: str(formData, "position"),
    startDate: optStr(formData, "startDate"),
    endDate: optStr(formData, "endDate"),
    description: optStr(formData, "description"),
    industry: optStr(formData, "industry"),
    isCurrent: formData.get("isCurrent") === "on",
  });
  revalidatePath("/app/profile");
}

export async function removeWorkExperienceAction(id: string) {
  await requireStudent();
  await studentService.removeWorkExperience(id);
  revalidatePath("/app/profile");
}
