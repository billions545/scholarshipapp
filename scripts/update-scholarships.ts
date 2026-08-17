// One-off targeted update for live production data — bumps scholarship
// discounts and turns the Aurora fellowship into a fully-funded, published
// opportunity. Matches existing rows by slug; does NOT use prisma db seed
// against production since that would create duplicate catalog rows.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rheinland = await prisma.opportunity.update({
    where: { slug: "rheinland-msc-computer-science-scholarship" },
    data: {
      scholarshipPercentage: 98,
      description:
        "A near-fully funded scholarship for outstanding international students entering the MSc Computer Science programme at Rheinland University.",
      benefits: "98% tuition waiver, relocation support, and a dedicated academic mentor.",
    },
  });
  console.log(`Updated ${rheinland.slug} -> ${rheinland.scholarshipPercentage}%`);

  const northbridge = await prisma.opportunity.update({
    where: { slug: "northbridge-ba-business-tuition-discount" },
    data: {
      scholarshipPercentage: 60,
      benefits: "60% tuition discount for all three years, subject to maintaining good academic standing.",
    },
  });
  console.log(`Updated ${northbridge.slug} -> ${northbridge.scholarshipPercentage}%`);

  const aurora = await prisma.opportunity.update({
    where: { slug: "aurora-online-mba-fellowship" },
    data: {
      category: "FULLY_FUNDED",
      description: "A fully funded fellowship covering 100% of tuition for working professionals pursuing an online MBA.",
      benefits: "100% tuition covered, flexible online schedule, and a dedicated career coach.",
      applicationProcessDescription:
        "Complete your profile, pass the eligibility check, upload required documents, and submit for review by our admissions team.",
      tuitionAmount: 400000000,
      applicationFeeAmount: 3000000,
      scholarshipPercentage: 100,
      serviceFeeAmount: 3000000,
      languageRequirement: "IELTS 6.5 or equivalent",
      deadline: new Date("2027-06-01"),
      intake: "Fall 2027",
      estimatedProcessingDays: 21,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  console.log(`Updated ${aurora.slug} -> PUBLISHED / ${aurora.scholarshipPercentage}%`);

  const existingRules = await prisma.eligibilityRule.count({ where: { opportunityId: aurora.id } });
  if (existingRules === 0) {
    await prisma.eligibilityRule.createMany({
      data: [
        { opportunityId: aurora.id, field: "qualificationLevel", operator: "GREATER_THAN_OR_EQUAL", value: "BACHELOR", label: "Bachelor's degree required", required: true },
        { opportunityId: aurora.id, field: "gpa", operator: "GREATER_THAN_OR_EQUAL", value: "3.0", label: "Minimum GPA of 3.0 (or equivalent)", required: true },
      ],
    });
    console.log("Added Aurora eligibility rules.");
  }

  const existingDocs = await prisma.documentRequirement.count({ where: { opportunityId: aurora.id } });
  if (existingDocs === 0) {
    await prisma.documentRequirement.createMany({
      data: [
        { opportunityId: aurora.id, documentType: "PASSPORT", required: true, conditional: false },
        { opportunityId: aurora.id, documentType: "DEGREE_CERTIFICATE", required: true, conditional: false },
        { opportunityId: aurora.id, documentType: "TRANSCRIPT", required: true, conditional: false },
        { opportunityId: aurora.id, documentType: "CV", required: true, conditional: false },
        { opportunityId: aurora.id, documentType: "ENGLISH_TEST", required: false, conditional: true, conditionDescription: "Required unless your degree was taught in English" },
      ],
    });
    console.log("Added Aurora document requirements.");
  }

  const auroraProgramme = await prisma.programme.findUniqueOrThrow({ where: { id: aurora.programmeId } });
  const auroraUniversity = await prisma.university.findUniqueOrThrow({ where: { id: auroraProgramme.universityId } });
  const existingCommissionRule = await prisma.commissionRule.count({ where: { partnerId: auroraUniversity.partnerId } });
  if (existingCommissionRule === 0) {
    await prisma.commissionRule.create({
      data: {
        partnerId: auroraUniversity.partnerId,
        triggerEvent: "APPLICATION_SUBMITTED",
        amountType: "FIXED",
        fixedAmount: 1000000,
        agentSharePercentage: 0,
      },
    });
    console.log("Added Aurora commission rule.");
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
