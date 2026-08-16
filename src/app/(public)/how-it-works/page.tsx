import Link from "next/link";
import { ui } from "@/lib/ui";

const STEPS = [
  ["1. Create your account", "Register in under a minute, then complete your academic and personal profile."],
  ["2. Discover opportunities", "Browse scholarships, university programmes and funded opportunities that match your goals."],
  ["3. Check your eligibility", "See a clear ELIGIBLE / POTENTIALLY ELIGIBLE / NOT ELIGIBLE result with exactly what's missing — never a guarantee, always a straight answer."],
  ["4. Apply", "Start an application in one click. We generate your document checklist automatically."],
  ["5. Upload documents", "Upload passport, transcripts, letters and more. Our team reviews each one and tells you if anything needs fixing."],
  ["6. Submit", "Once everything is approved, submit your application."],
  ["7. Track your progress", "Follow your status from partner review through admission, scholarship decision and enrolment — always know what happens next."],
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className={ui.pageHeading}>How it works</h1>
      <p className={`${ui.muted} mt-2`}>
        We help you identify suitable opportunities and guide you through the application process.
        All admission and scholarship decisions remain with the relevant university or provider.
      </p>

      <ol className="mt-8 flex flex-col gap-6">
        {STEPS.map(([title, body]) => (
          <li key={title} className={ui.card}>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className={`${ui.muted} mt-1`}>{body}</p>
          </li>
        ))}
      </ol>

      <Link href="/register" className={`${ui.btnPrimary} mt-8 inline-flex`}>
        Get started
      </Link>
    </div>
  );
}
