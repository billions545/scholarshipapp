import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth-actions";
import { ui } from "@/lib/ui";

const LINKS = [
  { href: "/agent/dashboard", label: "Dashboard" },
  { href: "/agent/students", label: "My Students" },
  { href: "/agent/commissions", label: "Commissions" },
];

export function AgentHeader({ name }: { name: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/agent/dashboard" className="text-lg font-bold text-indigo-700">
          Edu Bridge Point <span className="text-slate-400">Agent</span>
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
            <button type="submit" className={ui.btnGhost}>
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
