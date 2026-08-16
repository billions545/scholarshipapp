// Shared Tailwind class strings so form/button/card styling stays
// consistent without pulling in a component library for the MVP.
export const ui = {
  card: "rounded-xl border border-slate-200 bg-white p-6 shadow-sm",
  input:
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500",
  label: "mb-1 block text-sm font-medium text-slate-700",
  btnPrimary:
    "inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50",
  btnDanger:
    "inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700",
  btnGhost: "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100",
  pageHeading: "text-2xl font-bold tracking-tight text-slate-900",
  sectionHeading: "text-lg font-semibold text-slate-900",
  muted: "text-sm text-slate-500",
  errorText: "text-sm text-red-600",
} as const;

const STATUS_COLORS: Record<string, string> = {
  // Application statuses
  DRAFT: "bg-slate-100 text-slate-700",
  DOCUMENTS_REQUIRED: "bg-amber-100 text-amber-800",
  DOCUMENT_REVIEW: "bg-amber-100 text-amber-800",
  CORRECTION_REQUIRED: "bg-red-100 text-red-700",
  READY_FOR_SUBMISSION: "bg-blue-100 text-blue-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  PARTNER_REVIEW: "bg-purple-100 text-purple-700",
  ADMISSION_DECISION: "bg-purple-100 text-purple-700",
  OFFER_RECEIVED: "bg-emerald-100 text-emerald-700",
  OFFER_ACCEPTED: "bg-emerald-100 text-emerald-700",
  ENROLMENT_PENDING: "bg-emerald-100 text-emerald-700",
  ENROLLED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
  WITHDRAWN: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-slate-100 text-slate-500",
  // Opportunity statuses
  PUBLISHED: "bg-green-100 text-green-800",
  REVIEW: "bg-amber-100 text-amber-800",
  EXPIRED: "bg-slate-100 text-slate-500",
  ARCHIVED: "bg-slate-100 text-slate-500",
  // Document statuses
  UPLOADED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED_DOC: "bg-red-100 text-red-700",
  // Eligibility
  ELIGIBLE: "bg-green-100 text-green-800",
  POTENTIALLY_ELIGIBLE: "bg-amber-100 text-amber-800",
  NOT_ELIGIBLE: "bg-red-100 text-red-700",
};

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? "bg-slate-100 text-slate-700";
}
