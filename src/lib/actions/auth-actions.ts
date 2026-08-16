"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { registerSchema, registerStudent, EmailInUseError } from "@/lib/services/user-service";

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function loginAction(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/app/dashboard";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    countryOfResidence: formData.get("countryOfResidence") || undefined,
    password: formData.get("password"),
    referralCode: formData.get("referralCode") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Please check your details and try again.";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  try {
    await registerStudent(parsed.data);
  } catch (error) {
    if (error instanceof EmailInUseError) {
      redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/app/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login");
    }
    throw error;
  }
}
