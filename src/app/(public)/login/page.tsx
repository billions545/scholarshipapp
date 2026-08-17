import Link from "next/link";
import { loginAction } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col px-6 py-16">
      <h1 className={ui.pageHeading}>Log in</h1>
      <p className={`${ui.muted} mt-1`}>Continue your application journey.</p>

      <form action={loginAction} className={`${ui.card} mt-6 flex flex-col gap-4`}>
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/app/dashboard"} />
        {error && (
          <p className={`${ui.errorText} rounded-lg bg-red-50 p-3`}>
            Invalid email or password. Please try again.
          </p>
        )}
        <div>
          <label className={ui.label} htmlFor="email">
            Email
          </label>
          <input className={ui.input} id="email" name="email" type="email" required />
        </div>
        <div>
          <label className={ui.label} htmlFor="password">
            Password
          </label>
          <input className={ui.input} id="password" name="password" type="password" required />
        </div>
        <SubmitButton pendingText="Logging in...">Log in</SubmitButton>
      </form>

      <p className={`${ui.muted} mt-4 text-center`}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Create one
        </Link>
      </p>
    </div>
  );
}
