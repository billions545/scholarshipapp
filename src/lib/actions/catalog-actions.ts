"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import * as catalog from "@/lib/services/catalog-service";

async function assertCanManageCatalog() {
  const user = await requireStaff();
  if (!hasPermission(user.role, "opportunity.manage")) {
    throw new Error("You do not have permission to manage the catalog.");
  }
  return user;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}
function optStr(formData: FormData, key: string): string | undefined {
  const v = str(formData, key);
  return v.length ? v : undefined;
}
function optNum(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  return v.length ? Number(v) : null;
}
// Admin enters whole Naira amounts; money is stored in minor units (kobo).
function optNaira(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  return v.length ? Math.round(Number(v) * 100) : null;
}

export async function createPartnerAction(formData: FormData) {
  await assertCanManageCatalog();
  const partner = await catalog.createPartner({
    name: str(formData, "name"),
    type: str(formData, "type"),
    country: optStr(formData, "country"),
    contactName: optStr(formData, "contactName"),
    contactEmail: optStr(formData, "contactEmail"),
    contactPhone: optStr(formData, "contactPhone"),
    description: optStr(formData, "description"),
  });
  revalidatePath("/admin/partners");
  redirect(`/admin/partners/${partner.id}`);
}

export async function createUniversityAction(formData: FormData) {
  await assertCanManageCatalog();
  const partnerId = str(formData, "partnerId");
  await catalog.createUniversity({
    partnerId,
    name: str(formData, "name"),
    country: optStr(formData, "country"),
    city: optStr(formData, "city"),
    website: optStr(formData, "website"),
  });
  revalidatePath(`/admin/partners/${partnerId}`);
}

export async function createProgrammeAction(formData: FormData) {
  await assertCanManageCatalog();
  const universityId = str(formData, "universityId");
  await catalog.createProgramme({
    universityId,
    name: str(formData, "name"),
    degreeLevel: str(formData, "degreeLevel"),
    fieldOfStudy: optStr(formData, "fieldOfStudy"),
    studyMode: optStr(formData, "studyMode"),
    durationMonths: optNum(formData, "durationMonths") ?? undefined,
  });
  revalidatePath(`/admin/universities/${universityId}`);
}

export async function createOpportunityAction(formData: FormData) {
  await assertCanManageCatalog();
  const deadlineRaw = optStr(formData, "deadline");
  const opportunity = await catalog.createOpportunity({
    programmeId: str(formData, "programmeId"),
    title: str(formData, "title"),
    type: str(formData, "type"),
    category: optStr(formData, "category") ?? null,
    country: optStr(formData, "country"),
    city: optStr(formData, "city"),
    description: optStr(formData, "description"),
    benefits: optStr(formData, "benefits"),
    applicationProcessDescription: optStr(formData, "applicationProcessDescription"),
    tuitionAmount: optNaira(formData, "tuitionAmount"),
    applicationFeeAmount: optNaira(formData, "applicationFeeAmount"),
    scholarshipAmount: optNaira(formData, "scholarshipAmount"),
    scholarshipPercentage: optNum(formData, "scholarshipPercentage"),
    serviceFeeAmount: optNaira(formData, "serviceFeeAmount"),
    languageRequirement: optStr(formData, "languageRequirement"),
    deadline: deadlineRaw ? new Date(deadlineRaw) : null,
    intake: optStr(formData, "intake"),
    estimatedProcessingDays: optNum(formData, "estimatedProcessingDays"),
  });
  revalidatePath("/admin/opportunities");
  redirect(`/admin/opportunities/${opportunity.id}`);
}

export async function updateOpportunityAction(id: string, formData: FormData) {
  await assertCanManageCatalog();
  const deadlineRaw = optStr(formData, "deadline");
  await catalog.updateOpportunity(id, {
    title: str(formData, "title"),
    type: str(formData, "type"),
    category: optStr(formData, "category") ?? null,
    country: optStr(formData, "country"),
    city: optStr(formData, "city"),
    description: optStr(formData, "description"),
    benefits: optStr(formData, "benefits"),
    applicationProcessDescription: optStr(formData, "applicationProcessDescription"),
    tuitionAmount: optNaira(formData, "tuitionAmount"),
    applicationFeeAmount: optNaira(formData, "applicationFeeAmount"),
    scholarshipAmount: optNaira(formData, "scholarshipAmount"),
    scholarshipPercentage: optNum(formData, "scholarshipPercentage"),
    serviceFeeAmount: optNaira(formData, "serviceFeeAmount"),
    languageRequirement: optStr(formData, "languageRequirement"),
    deadline: deadlineRaw ? new Date(deadlineRaw) : null,
    intake: optStr(formData, "intake"),
    estimatedProcessingDays: optNum(formData, "estimatedProcessingDays"),
  });
  revalidatePath(`/admin/opportunities/${id}`);
}

export async function setOpportunityStatusAction(id: string, status: string) {
  await assertCanManageCatalog();
  await catalog.setOpportunityStatus(id, status);
  revalidatePath(`/admin/opportunities/${id}`);
  revalidatePath("/admin/opportunities");
  revalidatePath("/opportunities");
}

export async function addEligibilityRuleAction(formData: FormData) {
  await assertCanManageCatalog();
  const opportunityId = str(formData, "opportunityId");
  await catalog.addEligibilityRule({
    opportunityId,
    field: str(formData, "field"),
    operator: str(formData, "operator"),
    value: str(formData, "value"),
    label: str(formData, "label"),
    required: formData.get("required") === "on",
  });
  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

export async function removeEligibilityRuleAction(id: string, opportunityId: string) {
  await assertCanManageCatalog();
  await catalog.removeEligibilityRule(id);
  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

export async function addDocumentRequirementAction(formData: FormData) {
  await assertCanManageCatalog();
  const opportunityId = str(formData, "opportunityId");
  await catalog.addDocumentRequirement({
    opportunityId,
    documentType: str(formData, "documentType"),
    required: formData.get("required") === "on",
    conditional: formData.get("conditional") === "on",
    conditionDescription: optStr(formData, "conditionDescription"),
  });
  revalidatePath(`/admin/opportunities/${opportunityId}`);
}

export async function removeDocumentRequirementAction(id: string, opportunityId: string) {
  await assertCanManageCatalog();
  await catalog.removeDocumentRequirement(id);
  revalidatePath(`/admin/opportunities/${opportunityId}`);
}
