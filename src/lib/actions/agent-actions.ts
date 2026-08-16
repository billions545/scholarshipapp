"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { hasPermission } from "@/lib/rbac";
import { createAgent, EmailInUseError } from "@/lib/services/agent-service";

export async function createAgentAction(formData: FormData) {
  const user = await requireStaff();
  if (!hasPermission(user.role, "agent.manage")) throw new Error("Not permitted.");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await createAgent({ firstName, lastName, email, password });
  } catch (error) {
    if (error instanceof EmailInUseError) {
      redirect(`/admin/agents?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }
  revalidatePath("/admin/agents");
}
