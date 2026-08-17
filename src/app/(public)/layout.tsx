import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { LogoMark } from "@/components/logo";

const FOOTER_LINKS = [
  { href: "/opportunities", label: "Browse Opportunities" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/register", label: "Get Started" },
  { href: "/login", label: "Log In" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div>
              <p className="flex items-center gap-2 text-lg font-bold text-white">
                <LogoMark className="h-8 w-8" />
                Edu Bridge Point
              </p>
              <p className="mt-2 max-w-sm text-sm text-slate-400">
                The guided way to discover and apply for scholarships and international education
                opportunities.
              </p>
            </div>
            <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-300">
              {FOOTER_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
            Edu Bridge Point helps students discover education opportunities and guides them through the
            application process. All admission and scholarship decisions remain with the relevant university,
            institution, or provider.
          </div>
        </div>
      </footer>
    </div>
  );
}
