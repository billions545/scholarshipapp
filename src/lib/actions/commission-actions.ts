"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import * as commissionService from "@/lib/services/commission-service";

async function assertCanApprove() {
  const user = await requireStaff();
  if (!hasPermission(user.role, "commission.approve")) throw new Error("Not permitted.");
  return user;
}

export async function createCommissionRuleAction(formData: FormData) {
  const user = await requireStaff();
  if (!hasPermission(user.role, "commission.approve")) throw new Error("Not permitted.");

  const partnerId = String(formData.get("partnerId"));
  const opportunityId = String(formData.get("opportunityId") || "") || null;
  const amountType = String(formData.get("amountType"));

  await commissionService.createCommissionRule({
    partnerId,
    opportunityId,
    triggerEvent: String(formData.get("triggerEvent")),
    amountType,
    fixedAmount: amountType === "FIXED" ? Number(formData.get("fixedAmount")) : null,
    percentage: amountType === "PERCENTAGE" ? Number(formData.get("percentage")) : null,
    percentageBasis: amountType === "PERCENTAGE" ? String(formData.get("percentageBasis")) : null,
    agentSharePercentage: Number(formData.get("agentSharePercentage") || 0),
  });
  revalidatePath("/admin/commissions");
  revalidatePath(`/admin/partners/${partnerId}`);
}

export async function approveCommissionAction(commissionId: string) {
  const user = await assertCanApprove();
  await commissionService.approveCommission(commissionId, user.id);
  revalidatePath("/admin/commissions");
}

export async function rejectCommissionAction(commissionId: string) {
  await assertCanApprove();
  await commissionService.rejectCommission(commissionId);
  revalidatePath("/admin/commissions");
}

export async function markCommissionPaidAction(commissionId: string) {
  await assertCanApprove();
  await commissionService.markCommissionPaid(commissionId);
  revalidatePath("/admin/commissions");
}
