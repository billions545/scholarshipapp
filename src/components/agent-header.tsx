import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "/agent/dashboard", label: "Dashboard" },
  { href: "/agent/students", label: "My Students" },
  { href: "/agent/commissions", label: "Commissions" },
];

export function AgentHeader({ name }: { name: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/agent/dashboard" className="flex items-center gap-2">
          <Logo className="h-14 w-auto" />
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">Agent</span>
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
