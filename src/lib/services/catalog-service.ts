import { prisma } from "@/lib/prisma";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createPartner(data: {
  name: string;
  type: string;
  country?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
}) {
  return prisma.partner.create({ data });
}

export async function createUniversity(data: {
  partnerId: string;
  name: string;
  country?: string;
  city?: string;
  website?: string;
}) {
  return prisma.university.create({ data });
}

export async function createProgramme(data: {
  universityId: string;
  name: string;
  degreeLevel: string;
  fieldOfStudy?: string;
  studyMode?: string;
  durationMonths?: number;
}) {
  return prisma.programme.create({ data });
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "opportunity";
  let slug = base;
  let n = 1;
  // Small catalogs in MVP — a loop here is fine.
  while (await prisma.opportunity.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

export type OpportunityInput = {
  programmeId: string;
  title: string;
  type: string;
  category?: string | null;
  country?: string;
  city?: string;
  description?: string;
  benefits?: string;
  applicationProcessDescription?: string;
  tuitionAmount?: number | null;
  applicationFeeAmount?: number | null;
  scholarshipAmount?: number | null;
  scholarshipPercentage?: number | null;
  serviceFeeAmount?: number | null;
  languageRequirement?: string;
  deadline?: Date | null;
  intake?: string;
  estimatedProcessingDays?: number | null;
};

export async function createOpportunity(data: OpportunityInput) {
  const slug = await uniqueSlug(data.title);
  return prisma.opportunity.create({ data: { ...data, slug, status: "DRAFT" } });
}

export async function updateOpportunity(id: string, data: Partial<OpportunityInput>) {
  return prisma.opportunity.update({ where: { id }, data });
}

export async function setOpportunityStatus(id: string, status: string) {
  return prisma.opportunity.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLISHED" ? new Date() : undefined },
  });
}

export async function addEligibilityRule(data: {
  opportunityId: string;
  field: string;
  operator: string;
  value: string;
  label: string;
  required: boolean;
}) {
  return prisma.eligibilityRule.create({ data });
}

export async function removeEligibilityRule(id: string) {
  return prisma.eligibilityRule.delete({ where: { id } });
}

export async function addDocumentRequirement(data: {
  opportunityId: string;
  documentType: string;
  required: boolean;
  conditional: boolean;
  conditionDescription?: string;
}) {
  return prisma.documentRequirement.create({ data });
}

export async function removeDocumentRequirement(id: string) {
  return prisma.documentRequirement.delete({ where: { id } });
}

export type OpportunityFilters = {
  q?: string;
  country?: string;
  type?: string;
  degreeLevel?: string;
};

export async function listPublishedOpportunities(filters: OpportunityFilters) {
  return prisma.opportunity.findMany({
    where: {
      status: "PUBLISHED",
      ...(filters.country ? { country: filters.country } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q } },
              { description: { contains: filters.q } },
            ],
          }
        : {}),
      ...(filters.degreeLevel ? { programme: { degreeLevel: filters.degreeLevel } } : {}),
    },
    include: { programme: { include: { university: true } } },
    orderBy: { publishedAt: "desc" },
  });
}
