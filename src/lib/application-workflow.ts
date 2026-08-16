import type { ApplicationStatus } from "@/lib/enums";

// Application state machine (PRD §25, §119-120). Terminal exits (REJECTED /
// WITHDRAWN / CANCELLED) are reachable from most pre-enrolment states rather
// than enumerated on every node below. DRAFT skips straight to
// DOCUMENTS_REQUIRED when the opportunity has no service fee configured;
// otherwise it routes through PAYMENT_REQUIRED / PAYMENT_CONFIRMED first.
export const FORWARD_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ["PAYMENT_REQUIRED", "DOCUMENTS_REQUIRED"],
  PAYMENT_REQUIRED: ["PAYMENT_CONFIRMED"],
  PAYMENT_CONFIRMED: ["DOCUMENTS_REQUIRED"],
  DOCUMENTS_REQUIRED: ["DOCUMENT_REVIEW"],
  DOCUMENT_REVIEW: ["CORRECTION_REQUIRED", "READY_FOR_SUBMISSION"],
  CORRECTION_REQUIRED: ["DOCUMENT_REVIEW"],
  READY_FOR_SUBMISSION: ["SUBMITTED"],
  SUBMITTED: ["PARTNER_REVIEW"],
  PARTNER_REVIEW: ["ADMISSION_DECISION"],
  ADMISSION_DECISION: ["OFFER_RECEIVED", "REJECTED"],
  OFFER_RECEIVED: ["OFFER_ACCEPTED", "REJECTED"],
  OFFER_ACCEPTED: ["ENROLMENT_PENDING"],
  ENROLMENT_PENDING: ["ENROLLED"],
  ENROLLED: [],
  REJECTED: [],
  WITHDRAWN: [],
  CANCELLED: [],
};

const EXIT_ELIGIBLE: ApplicationStatus[] = [
  "DRAFT",
  "PAYMENT_REQUIRED",
  "PAYMENT_CONFIRMED",
  "DOCUMENTS_REQUIRED",
  "DOCUMENT_REVIEW",
  "CORRECTION_REQUIRED",
  "READY_FOR_SUBMISSION",
  "SUBMITTED",
  "PARTNER_REVIEW",
  "ADMISSION_DECISION",
];

export function availableStaffTransitions(current: ApplicationStatus): ApplicationStatus[] {
  const forward = FORWARD_TRANSITIONS[current] ?? [];
  const exits: ApplicationStatus[] = EXIT_ELIGIBLE.includes(current) ? ["WITHDRAWN", "CANCELLED"] : [];
  return [...forward, ...exits.filter((e) => !forward.includes(e))];
}

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return availableStaffTransitions(from).includes(to);
}

// Recomputes DOCUMENTS_REQUIRED / DOCUMENT_REVIEW / CORRECTION_REQUIRED /
// READY_FOR_SUBMISSION purely from the current document checklist state.
// Only meaningful while the application hasn't been submitted yet — after
// that, status changes are staff-driven (partner review, decisions, etc).
export function deriveDocumentStatus(
  requiredTypes: string[],
  latestStatusByType: Map<string, string>,
): "DOCUMENTS_REQUIRED" | "DOCUMENT_REVIEW" | "CORRECTION_REQUIRED" | "READY_FOR_SUBMISSION" {
  const missing = requiredTypes.some((t) => !latestStatusByType.has(t));
  if (missing) return "DOCUMENTS_REQUIRED";

  const statuses = requiredTypes.map((t) => latestStatusByType.get(t));
  if (statuses.some((s) => s === "REJECTED" || s === "CORRECTION_REQUIRED")) return "CORRECTION_REQUIRED";
  if (statuses.every((s) => s === "APPROVED")) return "READY_FOR_SUBMISSION";
  return "DOCUMENT_REVIEW";
}
