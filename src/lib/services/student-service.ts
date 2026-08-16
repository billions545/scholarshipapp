import { prisma } from "@/lib/prisma";
import { DEGREE_LEVEL_RANK } from "@/lib/enums";
import type { StudentFacts } from "@/lib/eligibility";

// Resolves the deterministic facts eligibility rules are evaluated against
// (PRD §21, §98) from the student's stored profile + academic records.
export async function getStudentFacts(studentProfileId: string): Promise<StudentFacts> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: { academicRecords: true },
  });
  if (!profile) {
    return { gpa: null, qualificationLevel: null, nationality: null, countryOfResidence: null, fieldOfStudy: null };
  }

  let highest = null;
  for (const rec of profile.academicRecords) {
    const rank = DEGREE_LEVEL_RANK[rec.level] ?? -1;
    const currentRank = highest ? DEGREE_LEVEL_RANK[highest.level] ?? -1 : -1;
    if (rank >= currentRank) highest = rec;
  }

  return {
    gpa: highest?.gpa ?? null,
    qualificationLevel: highest?.level ?? null,
    nationality: profile.nationality ?? null,
    countryOfResidence: profile.countryOfResidence ?? null,
    fieldOfStudy: highest?.fieldOfStudy ?? null,
  };
}

export type ProfileUpdateInput = {
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  countryOfResidence?: string;
  state?: string;
  address?: string;
  preferredContact?: string;
  passportNumber?: string;
  passportExpiry?: string;
  preferredCountry?: string;
  preferredDegreeLevel?: string;
  preferredField?: string;
  preferredIntake?: string;
  budget?: number | null;
  willingToRelocate?: boolean;
};

export async function updateStudentProfile(studentProfileId: string, data: ProfileUpdateInput) {
  return prisma.studentProfile.update({
    where: { id: studentProfileId },
    data: {
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      gender: data.gender,
      nationality: data.nationality,
      countryOfResidence: data.countryOfResidence,
      state: data.state,
      address: data.address,
      preferredContact: data.preferredContact,
      passportNumber: data.passportNumber,
      passportExpiry: data.passportExpiry ? new Date(data.passportExpiry) : undefined,
      preferredCountry: data.preferredCountry,
      preferredDegreeLevel: data.preferredDegreeLevel,
      preferredField: data.preferredField,
      preferredIntake: data.preferredIntake,
      budget: data.budget,
      willingToRelocate: data.willingToRelocate,
    },
  });
}

export async function addAcademicRecord(
  studentProfileId: string,
  data: {
    level: string;
    institution: string;
    programme?: string;
    fieldOfStudy?: string;
    graduationDate?: string;
    gpa?: number | null;
    gradingScale?: string;
    classDivision?: string;
  },
) {
  return prisma.academicRecord.create({
    data: {
      studentProfileId,
      level: data.level,
      institution: data.institution,
      programme: data.programme,
      fieldOfStudy: data.fieldOfStudy,
      graduationDate: data.graduationDate ? new Date(data.graduationDate) : undefined,
      gpa: data.gpa ?? undefined,
      gradingScale: data.gradingScale,
      classDivision: data.classDivision,
    },
  });
}

export async function removeAcademicRecord(id: string) {
  return prisma.academicRecord.delete({ where: { id } });
}

export async function addWorkExperience(
  studentProfileId: string,
  data: {
    employer: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    industry?: string;
    isCurrent: boolean;
  },
) {
  return prisma.workExperience.create({
    data: {
      studentProfileId,
      employer: data.employer,
      position: data.position,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      description: data.description,
      industry: data.industry,
      isCurrent: data.isCurrent,
    },
  });
}

export async function removeWorkExperience(id: string) {
  return prisma.workExperience.delete({ where: { id } });
}

// Simple completeness score used on the student dashboard (PRD §62).
export function computeProfileCompleteness(profile: {
  dateOfBirth: Date | null;
  nationality: string | null;
  countryOfResidence: string | null;
  passportNumber: string | null;
  academicRecords: unknown[];
}): { percent: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [!!profile.dateOfBirth, "Date of birth"],
    [!!profile.nationality, "Nationality"],
    [!!profile.countryOfResidence, "Country of residence"],
    [!!profile.passportNumber, "Passport number"],
    [profile.academicRecords.length > 0, "At least one academic record"],
  ];
  const met = checks.filter(([ok]) => ok).length;
  return {
    percent: Math.round((met / checks.length) * 100),
    missing: checks.filter(([ok]) => !ok).map(([, label]) => label),
  };
}
