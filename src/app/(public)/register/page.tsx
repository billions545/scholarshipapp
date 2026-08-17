import Link from "next/link";
import { registerAction } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { ui } from "@/lib/ui";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ref?: string }>;
}) {
  const { error, ref } = await searchParams;

  return (
    <div className="mx-auto flex max-w-lg flex-col px-6 py-16">
      <h1 className={ui.pageHeading}>Create your account</h1>
      <p className={`${ui.muted} mt-1`}>
        It only takes a minute. You&apos;ll complete your full profile next.
      </p>

      <form action={registerAction} className={`${ui.card} mt-6 flex flex-col gap-4`}>
        {ref && <input type="hidden" name="referralCode" value={ref} />}
        {error && <p className={`${ui.errorText} rounded-lg bg-red-50 p-3`}>{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={ui.label} htmlFor="firstName">
              First name
            </label>
            <input className={ui.input} id="firstName" name="firstName" required />
          </div>
          <div>
            <label className={ui.label} htmlFor="lastName">
              Last name
            </label>
            <input className={ui.input} id="lastName" name="lastName" required />
          </div>
        </div>
        <div>
          <label className={ui.label} htmlFor="email">
            Email
          </label>
          <input className={ui.input} id="email" name="email" type="email" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={ui.label} htmlFor="phone">
              Phone number
            </label>
            <input className={ui.input} id="phone" name="phone" />
          </div>
          <div>
            <label className={ui.label} htmlFor="countryOfResidence">
              Country of residence
            </label>
            <input
              className={ui.input}
              id="countryOfResidence"
              name="countryOfResidence"
              defaultValue="Nigeria"
            />
          </div>
        </div>
        <div>
          <label className={ui.label} htmlFor="password">
            Password
          </label>
          <input
            className={ui.input}
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
          />
          <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
        </div>
        {!ref && (
          <div>
            <label className={ui.label} htmlFor="referralCode">
              Referral code <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input className={ui.input} id="referralCode" name="referralCode" />
          </div>
        )}
        <SubmitButton pendingText="Creating account...">Create account</SubmitButton>
      </form>

      <p className={`${ui.muted} mt-4 text-center`}>
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
