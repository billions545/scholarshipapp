import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(data: {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
  referralCode?: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      passwordHash,
      emailVerified: true,
      referralCode: data.referralCode,
    },
  });
}

async function main() {
  console.log("Seeding...");

  await upsertUser({
    email: "admin@edubridgepoint.com",
    firstName: "Amaka",
    lastName: "Admin",
    role: "SUPER_ADMIN",
    password: "password123",
  });

  const adviser = await upsertUser({
    email: "adviser@edubridgepoint.com",
    firstName: "Tunde",
    lastName: "Adviser",
    role: "ADMISSIONS_OFFICER",
    password: "password123",
  });

  await upsertUser({
    email: "reviewer@edubridgepoint.com",
    firstName: "Fatima",
    lastName: "Reviewer",
    role: "DOCUMENT_REVIEWER",
    password: "password123",
  });

  const agent = await upsertUser({
    email: "agent@edubridgepoint.com",
    firstName: "Chidi",
    lastName: "Agent",
    role: "AGENT",
    password: "password123",
    referralCode: "CHIDI2026",
  });

  await upsertUser({
    email: "finance@edubridgepoint.com",
    firstName: "Bola",
    lastName: "Finance",
    role: "FINANCE_ADMIN",
    password: "password123",
  });

  // --- Partner 1: Rheinland University (Germany) ---
  const rheinlandPartner = await prisma.partner.create({
    data: { name: "Rheinland University", type: "UNIVERSITY", country: "Germany", contactEmail: "admissions@rheinland.example.edu" },
  });
  const rheinland = await prisma.university.create({
    data: { partnerId: rheinlandPartner.id, name: "Rheinland University", country: "Germany", city: "Cologne", website: "https://rheinland.example.edu" },
  });
  const mscCompSci = await prisma.programme.create({
    data: { universityId: rheinland.id, name: "MSc Computer Science", degreeLevel: "MASTER", fieldOfStudy: "Computer Science", studyMode: "ON_CAMPUS", durationMonths: 24 },
  });
  const daadScholarship = await prisma.opportunity.create({
    data: {
      programmeId: mscCompSci.id,
      slug: "rheinland-msc-computer-science-scholarship",
      title: "Rheinland MSc Computer Science Scholarship",
      type: "SCHOLARSHIP",
      category: "PARTIALLY_FUNDED",
      country: "Germany",
      city: "Cologne",
      description: "A near-fully funded scholarship for outstanding international students entering the MSc Computer Science programme at Rheinland University.",
      benefits: "98% tuition waiver, relocation support, and a dedicated academic mentor.",
      applicationProcessDescription: "Complete your profile, pass the eligibility check, upload required documents, and submit for review by our admissions team.",
      tuitionAmount: 500000000,
      applicationFeeAmount: 5000000,
      scholarshipPercentage: 98,
      serviceFeeAmount: 3500000,
      languageRequirement: "IELTS 6.5 or equivalent",
      deadline: new Date("2027-03-01"),
      intake: "Fall 2027",
      estimatedProcessingDays: 30,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  await prisma.eligibilityRule.createMany({
    data: [
      { opportunityId: daadScholarship.id, field: "qualificationLevel", operator: "GREATER_THAN_OR_EQUAL", value: "BACHELOR", label: "Bachelor's degree required", required: true },
      { opportunityId: daadScholarship.id, field: "gpa", operator: "GREATER_THAN_OR_EQUAL", value: "3.0", label: "Minimum GPA of 3.0 (or equivalent)", required: true },
      { opportunityId: daadScholarship.id, field: "countryOfResidence", operator: "IN", value: "Nigeria,Ghana,Kenya", label: "Open to residents of Nigeria, Ghana, or Kenya", required: true },
    ],
  });
  await prisma.documentRequirement.createMany({
    data: [
      { opportunityId: daadScholarship.id, documentType: "PASSPORT", required: true, conditional: false },
      { opportunityId: daadScholarship.id, documentType: "DEGREE_CERTIFICATE", required: true, conditional: false },
      { opportunityId: daadScholarship.id, documentType: "TRANSCRIPT", required: true, conditional: false },
      { opportunityId: daadScholarship.id, documentType: "CV", required: true, conditional: false },
      { opportunityId: daadScholarship.id, documentType: "MOTIVATION_LETTER", required: true, conditional: false },
      { opportunityId: daadScholarship.id, documentType: "ENGLISH_TEST", required: false, conditional: true, conditionDescription: "Required unless your degree was taught in English" },
    ],
  });
  // 3% of tuition, payable to the agency, once a referred student enrols —
  // 25% of that is passed on to the referring agent.
  await prisma.commissionRule.create({
    data: {
      partnerId: rheinlandPartner.id,
      triggerEvent: "STUDENT_ENROLLED",
      amountType: "PERCENTAGE",
      percentage: 3,
      percentageBasis: "TUITION",
      agentSharePercentage: 25,
    },
  });

  // --- Partner 2: Northbridge College (UK) ---
  const northbridgePartner = await prisma.partner.create({
    data: { name: "Northbridge College", type: "UNIVERSITY", country: "United Kingdom", contactEmail: "admissions@northbridge.example.ac.uk" },
  });
  const northbridge = await prisma.university.create({
    data: { partnerId: northbridgePartner.id, name: "Northbridge College", country: "United Kingdom", city: "Manchester" },
  });
  const baBusiness = await prisma.programme.create({
    data: { universityId: northbridge.id, name: "BA Business Administration", degreeLevel: "BACHELOR", fieldOfStudy: "Business", studyMode: "ON_CAMPUS", durationMonths: 36 },
  });
  const businessDiscount = await prisma.opportunity.create({
    data: {
      programmeId: baBusiness.id,
      slug: "northbridge-ba-business-tuition-discount",
      title: "Northbridge Business Administration Tuition Discount",
      type: "TUITION_DISCOUNT",
      category: "MERIT_BASED",
      country: "United Kingdom",
      city: "Manchester",
      description: "A merit-based tuition discount for students with strong secondary school results applying to our undergraduate Business Administration programme.",
      benefits: "60% tuition discount for all three years, subject to maintaining good academic standing.",
      applicationProcessDescription: "Submit your application with secondary school results; our admissions team reviews within two weeks.",
      tuitionAmount: 300000000,
      applicationFeeAmount: 2500000,
      scholarshipPercentage: 60,
      serviceFeeAmount: 2500000,
      languageRequirement: "IELTS 6.0 or equivalent",
      deadline: new Date("2027-05-15"),
      intake: "Fall 2027",
      estimatedProcessingDays: 14,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  await prisma.eligibilityRule.createMany({
    data: [
      { opportunityId: businessDiscount.id, field: "qualificationLevel", operator: "GREATER_THAN_OR_EQUAL", value: "SECONDARY", label: "Completed secondary education", required: true },
      { opportunityId: businessDiscount.id, field: "nationality", operator: "EXISTS", value: "", label: "Nationality on file", required: false },
    ],
  });
  await prisma.documentRequirement.createMany({
    data: [
      { opportunityId: businessDiscount.id, documentType: "PASSPORT", required: true, conditional: false },
      { opportunityId: businessDiscount.id, documentType: "TRANSCRIPT", required: true, conditional: false },
      { opportunityId: businessDiscount.id, documentType: "CV", required: false, conditional: false },
    ],
  });
  // Flat referral fee the moment an application is submitted, no agent share.
  await prisma.commissionRule.create({
    data: {
      partnerId: northbridgePartner.id,
      triggerEvent: "APPLICATION_SUBMITTED",
      amountType: "FIXED",
      fixedAmount: 1000000, // NGN 10,000
      agentSharePercentage: 0,
    },
  });

  // --- Partner 3: Aurora Online Institute (fully online, fully-funded fellowship) ---
  const auroraPartner = await prisma.partner.create({
    data: { name: "Aurora Online Institute", type: "EDUCATION_PLATFORM", country: "Canada" },
  });
  const aurora = await prisma.university.create({
    data: { partnerId: auroraPartner.id, name: "Aurora Online Institute", country: "Canada" },
  });
  const onlineMBA = await prisma.programme.create({
    data: { universityId: aurora.id, name: "Online MBA", degreeLevel: "MASTER", fieldOfStudy: "Business Administration", studyMode: "ONLINE", durationMonths: 18 },
  });
  const auroraFellowship = await prisma.opportunity.create({
    data: {
      programmeId: onlineMBA.id,
      slug: "aurora-online-mba-fellowship",
      title: "Aurora Online MBA Fellowship",
      type: "FELLOWSHIP",
      category: "FULLY_FUNDED",
      country: "Canada",
      description: "A fully funded fellowship covering 100% of tuition for working professionals pursuing an online MBA.",
      benefits: "100% tuition covered, flexible online schedule, and a dedicated career coach.",
      applicationProcessDescription: "Complete your profile, pass the eligibility check, upload required documents, and submit for review by our admissions team.",
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
  await prisma.eligibilityRule.createMany({
    data: [
      { opportunityId: auroraFellowship.id, field: "qualificationLevel", operator: "GREATER_THAN_OR_EQUAL", value: "BACHELOR", label: "Bachelor's degree required", required: true },
      { opportunityId: auroraFellowship.id, field: "gpa", operator: "GREATER_THAN_OR_EQUAL", value: "3.0", label: "Minimum GPA of 3.0 (or equivalent)", required: true },
    ],
  });
  await prisma.documentRequirement.createMany({
    data: [
      { opportunityId: auroraFellowship.id, documentType: "PASSPORT", required: true, conditional: false },
      { opportunityId: auroraFellowship.id, documentType: "DEGREE_CERTIFICATE", required: true, conditional: false },
      { opportunityId: auroraFellowship.id, documentType: "TRANSCRIPT", required: true, conditional: false },
      { opportunityId: auroraFellowship.id, documentType: "CV", required: true, conditional: false },
      { opportunityId: auroraFellowship.id, documentType: "ENGLISH_TEST", required: false, conditional: true, conditionDescription: "Required unless your degree was taught in English" },
    ],
  });
  await prisma.commissionRule.create({
    data: {
      partnerId: auroraPartner.id,
      triggerEvent: "APPLICATION_SUBMITTED",
      amountType: "FIXED",
      fixedAmount: 1000000, // NGN 10,000
      agentSharePercentage: 0,
    },
  });

  // --- Demo student ---
  const studentUser = await upsertUser({
    email: "student@example.com",
    firstName: "David",
    lastName: "George",
    role: "STUDENT",
    password: "password123",
  });
  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      nationality: "Nigeria",
      countryOfResidence: "Nigeria",
      dateOfBirth: new Date("1999-04-12"),
      passportNumber: "A1234567",
      passportExpiry: new Date("2029-01-01"),
      preferredCountry: "Germany",
      preferredDegreeLevel: "MASTER",
      preferredField: "Computer Science",
      willingToRelocate: true,
      acquisitionSource: "AGENT",
      referralCode: agent.referralCode,
      agentId: agent.id,
      referredAt: new Date(),
      assignedAdviserId: adviser.id,
    },
  });
  await prisma.academicRecord.upsert({
    where: { id: "seed-academic-record-david" },
    update: {},
    create: {
      id: "seed-academic-record-david",
      studentProfileId: studentProfile.id,
      level: "BACHELOR",
      institution: "University of Lagos",
      programme: "BSc Computer Science",
      fieldOfStudy: "Computer Science",
      graduationDate: new Date("2022-07-01"),
      gpa: 4.31,
      gradingScale: "5.0",
      classDivision: "First Class",
    },
  });

  console.log("Seed complete.");
  console.log("---");
  console.log("Admin:    admin@edubridgepoint.com / password123");
  console.log("Adviser:  adviser@edubridgepoint.com / password123");
  console.log("Reviewer: reviewer@edubridgepoint.com / password123");
  console.log("Agent:    agent@edubridgepoint.com / password123 (referral code: CHIDI2026)");
  console.log("Finance:  finance@edubridgepoint.com / password123");
  console.log("Student:  student@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
