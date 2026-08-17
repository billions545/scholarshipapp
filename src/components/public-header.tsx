import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "@/components/logo";
import { ui } from "@/lib/ui";

export async function PublicHeader() {
  const user = await getCurrentUser();
  const homeHref = !user ? null : user.role === "STUDENT" ? "/app/dashboard" : "/admin";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="shrink-0">
          <Logo className="h-14 w-auto sm:h-16" />
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600 sm:gap-6">
          <Link href="/opportunities" className="hidden hover:text-slate-900 sm:inline">
            Browse Opportunities
          </Link>
          <Link href="/how-it-works" className="hidden hover:text-slate-900 sm:inline">
            How It Works
          </Link>
          {user && homeHref ? (
            <Link href={homeHref} className={`${ui.btnPrimary} whitespace-nowrap`}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-slate-900">
                Log in
              </Link>
              <Link href="/register" className={`${ui.btnPrimary} whitespace-nowrap`}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
