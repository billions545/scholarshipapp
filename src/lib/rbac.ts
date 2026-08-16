import type { UserRole } from "@/lib/enums";

// Granular permission strings (PRD §70). Kept flat and explicit rather than
// building a full permissions table in the DB for MVP — promoting this to
// a `roles`/`permissions`/`user_roles` schema later is a drop-in swap since
// every check in the app already goes through hasPermission().
export const PERMISSIONS = [
  "student.read",
  "student.read.all",
  "student.update",
  "opportunity.manage",
  "application.read.own",
  "application.read.assigned",
  "application.read.all",
  "application.update",
  "application.submit",
  "document.upload",
  "document.review",
  "admin.dashboard",
  "payment.read",
  "payment.refund",
  "commission.read",
  "commission.approve",
  "agent.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: [...PERMISSIONS],
  FINANCE_ADMIN: [
    "student.read.all",
    "application.read.all",
    "admin.dashboard",
    "payment.read",
    "payment.refund",
    "commission.read",
    "commission.approve",
    "agent.manage",
  ],
  ADMISSIONS_MANAGER: [
    "student.read.all",
    "opportunity.manage",
    "application.read.all",
    "application.update",
    "application.submit",
    "document.review",
    "admin.dashboard",
    "payment.read",
    "commission.read",
    "agent.manage",
  ],
  ADMISSIONS_OFFICER: [
    "student.read.all",
    "application.read.assigned",
    "application.update",
    "application.submit",
    "document.review",
    "admin.dashboard",
    "payment.read",
  ],
  DOCUMENT_REVIEWER: ["student.read.all", "application.read.all", "document.review", "admin.dashboard"],
  AGENT: ["application.read.own", "commission.read"],
  STUDENT: ["student.read", "student.update", "application.read.own", "application.submit", "document.upload"],
  PARTNER_ADMIN: ["application.read.assigned"],
  PARTNER_REVIEWER: ["application.read.assigned"],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as UserRole];
  return perms ? perms.includes(permission) : false;
}

export function isStaffRole(role: string): boolean {
  return role !== "STUDENT" && role !== "AGENT" && role !== "PARTNER_ADMIN" && role !== "PARTNER_REVIEWER";
}
