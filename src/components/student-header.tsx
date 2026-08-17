import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/profile", label: "My Profile" },
  { href: "/app/applications", label: "My Applications" },
  { href: "/opportunities", label: "Browse Opportunities" },
];

export function StudentHeader({ name }: { name: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/app/dashboard">
          <Logo className="h-14 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-slate-900">
              {l.label}
            </Link>
          ))}
          <span className="text-slate-400">|</span>
          <span className="text-slate-700">{name}</span>
          <form action={logoutAction}>
            <SubmitButton variant="ghost" pendingText="Signing out...">
              Sign out
            </SubmitButton>
          </form>
        </nav>
      </div>
    </header>
  );
}
