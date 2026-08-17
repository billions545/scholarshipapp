// Central registry of the platform's controlled vocabularies.
// SQLite has no native enum type, so these are enforced in application code
// (see zod schemas below) rather than at the database level. Keeping every
// list in one file is what lets new opportunity types / statuses / document
// categories get added without hunting through the codebase (PRD §153).

export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_ADMIN",
  "ADMISSIONS_MANAGER",
  "ADMISSIONS_OFFICER",
  "DOCUMENT_REVIEWER",
  "AGENT",
  "STUDENT",
  "PARTNER_ADMIN",
  "PARTNER_REVIEWER",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Roles that can access /admin and act as staff.
export const STAFF_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "FINANCE_ADMIN",
  "ADMISSIONS_MANAGER",
  "ADMISSIONS_OFFICER",
  "DOCUMENT_REVIEWER",
];

export const OPPORTUNITY_TYPES = [
  "SCHOLARSHIP",
  "UNIVERSITY_PROGRAMME",
  "TUITION_DISCOUNT",
  "FELLOWSHIP",
  "GRANT",
  "ONLINE_DEGREE",
  "ON_CAMPUS_PROGRAMME",
  "PROFESSIONAL_PROGRAMME",
  "OTHER",
] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const OPPORTUNITY_CATEGORIES = [
  "FULLY_FUNDED",
  "PARTIALLY_FUNDED",
  "MERIT_BASED",
  "NEED_BASED",
  "SPORTS",
  "RESEARCH",
  "GOVERNMENT",
  "UNIVERSITY",
  "PRIVATE_FOUNDATION",
  "INTERNATIONAL",
] as const;
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number];

export const OPPORTUNITY_STATUSES = [
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "EXPIRED",
  "ARCHIVED",
] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const DEGREE_LEVELS = [
  "SECONDARY",
  "DIPLOMA",
  "HND",
  "BACHELOR",
  "MASTER",
  "PHD",
  "PROFESSIONAL_CERTIFICATE",
] as const;
export type DegreeLevel = (typeof DEGREE_LEVELS)[number];
// Order matters: used to compare qualification_level >= X eligibility rules.
export const DEGREE_LEVEL_RANK: Record<string, number> = {
  SECONDARY: 0,
  CERTIFICATE: 1,
  DIPLOMA: 1,
  HND: 2,
  BACHELOR: 3,
  MASTER: 4,
  PROFESSIONAL_CERTIFICATE: 4,
  PHD: 5,
};

export const STUDY_MODES = ["ON_CAMPUS", "ONLINE", "HYBRID"] as const;
export type StudyMode = (typeof STUDY_MODES)[number];

export const ELIGIBILITY_OPERATORS = [
  "EQUALS",
  "NOT_EQUALS",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL",
  "IN",
  "NOT_IN",
  "CONTAINS",
  "EXISTS",
] as const;
export type EligibilityOperator = (typeof ELIGIBILITY_OPERATORS)[number];

// Fields an eligibility rule can be evaluated against, resolved from the
// student's profile + academic records at evaluation time.
export const ELIGIBILITY_FIELDS = [
  "gpa",
  "qualificationLevel",
  "nationality",
  "countryOfResidence",
  "fieldOfStudy",
] as const;
export type EligibilityField = (typeof ELIGIBILITY_FIELDS)[number];

export const ELIGIBILITY_RESULTS = [
  "ELIGIBLE",
  "POTENTIALLY_ELIGIBLE",
  "NOT_ELIGIBLE",
] as const;
export type EligibilityResultValue = (typeof ELIGIBILITY_RESULTS)[number];

export const DOCUMENT_TYPES = [
  "PASSPORT",
  "NATIONAL_ID",
  "DEGREE_CERTIFICATE",
  "TRANSCRIPT",
  "CV",
  "MOTIVATION_LETTER",
  "STATEMENT_OF_PURPOSE",
  "RECOMMENDATION_LETTER",
  "ENGLISH_TEST",
  "FINANCIAL_DOCUMENT",
  "BANK_STATEMENT",
  "EMPLOYMENT_LETTER",
  "PORTFOLIO",
  "PHOTO",
  "OTHER",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_VERSION_STATUSES = [
  "UPLOADED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "CORRECTION_REQUIRED",
  "SUPERSEDED",
  "EXPIRED",
] as const;
export type DocumentVersionStatus = (typeof DOCUMENT_VERSION_STATUSES)[number];

// Application state machine (PRD §25, §119).
export const APPLICATION_STATUSES = [
  "DRAFT",
  "DOCUMENTS_REQUIRED",
  "DOCUMENT_REVIEW",
  "CORRECTION_REQUIRED",
  "PAYMENT_REQUIRED",
  "PAYMENT_CONFIRMED",
  "READY_FOR_SUBMISSION",
  "SUBMITTED",
  "PARTNER_REVIEW",
  "ADMISSION_DECISION",
  "OFFER_RECEIVED",
  "OFFER_ACCEPTED",
  "ENROLMENT_PENDING",
  "ENROLLED",
  "REJECTED",
  "WITHDRAWN",
  "CANCELLED",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// Simplified, student-facing label for each internal status (PRD §59).
export const APPLICATION_STATUS_STUDENT_LABEL: Record<ApplicationStatus, string> = {
  DRAFT: "Getting started",
  PAYMENT_REQUIRED: "Payment required",
  PAYMENT_CONFIRMED: "Payment confirmed",
  DOCUMENTS_REQUIRED: "Documents needed",
  DOCUMENT_REVIEW: "Documents being reviewed",
  CORRECTION_REQUIRED: "Action needed on a document",
  READY_FOR_SUBMISSION: "Ready to submit",
  SUBMITTED: "Submitted",
  PARTNER_REVIEW: "Under review by institution",
  ADMISSION_DECISION: "Awaiting admission decision",
  OFFER_RECEIVED: "Offer received",
  OFFER_ACCEPTED: "Offer accepted",
  ENROLMENT_PENDING: "Enrolment in progress",
  ENROLLED: "Enrolled",
  REJECTED: "Not successful",
  WITHDRAWN: "Withdrawn",
  CANCELLED: "Cancelled",
};

export const APPLICATION_TASK_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED",
] as const;
export type ApplicationTaskStatus = (typeof APPLICATION_TASK_STATUSES)[number];

export const TASK_ASSIGNEE_ROLES = ["STUDENT", "ADVISER", "REVIEWER", "ADMIN"] as const;
export type TaskAssigneeRole = (typeof TASK_ASSIGNEE_ROLES)[number];

export const APPLICATION_EVENT_TYPES = [
  "APPLICATION_CREATED",
  "ELIGIBILITY_COMPLETED",
  "PAYMENT_INITIATED",
  "PAYMENT_SUCCEEDED",
  "PAYMENT_FAILED",
  "DOCUMENT_UPLOADED",
  "DOCUMENT_APPROVED",
  "DOCUMENT_REJECTED",
  "STATUS_CHANGED",
  "SUBMITTED",
  "NOTE_ADDED",
  "PARTNER_UPDATE",
  "COMMISSION_CREATED",
] as const;
export type ApplicationEventType = (typeof APPLICATION_EVENT_TYPES)[number];

// --- Payments (PRD §40-43) ---

export const PAYMENT_TYPES = [
  "APPLICATION_FEE",
  "ADMINISTRATION_FEE",
  "DOCUMENT_REVIEW",
  "PREMIUM_SERVICE",
  "TEST_FEE",
  "VISA_SUPPORT",
  "OTHER_SERVICE",
] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const PAYMENT_STATUSES = ["PENDING", "SUCCESSFUL", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const INVOICE_STATUSES = ["UNPAID", "PAID", "VOID"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const REFUND_STATUSES = [
  "REFUND_REQUESTED",
  "REFUND_APPROVED",
  "REFUND_PROCESSING",
  "REFUNDED",
  "REFUND_REJECTED",
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

// --- Commissions (PRD §44-48) ---

export const COMMISSION_TRIGGER_EVENTS = [
  "APPLICATION_SUBMITTED",
  "STUDENT_ADMITTED",
  "STUDENT_ENROLLED",
] as const;
export type CommissionTriggerEvent = (typeof COMMISSION_TRIGGER_EVENTS)[number];

export const COMMISSION_AMOUNT_TYPES = ["FIXED", "PERCENTAGE"] as const;
export type CommissionAmountType = (typeof COMMISSION_AMOUNT_TYPES)[number];

export const COMMISSION_PERCENTAGE_BASES = ["TUITION", "SERVICE_FEE"] as const;
export type CommissionPercentageBasis = (typeof COMMISSION_PERCENTAGE_BASES)[number];

export const COMMISSION_STATUSES = [
  "EXPECTED",
  "PENDING",
  "ELIGIBLE",
  "APPROVED",
  "INVOICED",
  "PAID",
  "REJECTED",
  "CANCELLED",
] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];

export const PARTNER_TYPES = [
  "UNIVERSITY",
  "SCHOLARSHIP_PROVIDER",
  "EDUCATION_PLATFORM",
  "AGENCY",
  "GOVERNMENT",
  "FOUNDATION",
  "OTHER",
] as const;
export type PartnerType = (typeof PARTNER_TYPES)[number];

export const ACQUISITION_SOURCES = [
  "WEBSITE",
  "FACEBOOK",
  "INSTAGRAM",
  "WHATSAPP",
  "AGENT",
  "REFERRAL",
  "ADVERTISEMENT",
  "EVENT",
  "UNIVERSITY",
  "ORGANIC_SEARCH",
  "OTHER",
] as const;
export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

const ACRONYMS = new Set(["cv", "id", "ielts", "gpa"]);

export function labelize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}
