import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { LogoMark } from "@/components/logo";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/opportunities", label: "Opportunities" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/commissions", label: "Commissions" },
];

export function AdminHeader({ name, role }: { name: string; role: string }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-bold text-white">
            <LogoMark className="h-8 w-8" />
            Edu Bridge Point <span className="text-indigo-400">Admin</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-300">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span>
            {name} <span className="text-slate-500">- {role}</span>
          </span>
          <form action={logoutAction}>
            <SubmitButton
              variant="custom"
              pendingText="Signing out..."
              className="rounded-lg px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </div>
    </header>
  );
}
