import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/rbac";

function homeFor(role: string | undefined): string {
  if (!role) return "/login";
  if (isStaffRole(role)) return "/admin";
  if (role === "AGENT") return "/agent/dashboard";
  return "/app/dashboard";
}

export default auth(function proxy(req) {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = pathname.startsWith("/admin");
  const isStudentRoute = pathname.startsWith("/app");
  const isAgentRoute = pathname.startsWith("/agent");

  if ((isAdminRoute || isStudentRoute || isAgentRoute) && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn) {
    if (isAdminRoute && !isStaffRole(role!)) {
      return NextResponse.redirect(new URL(homeFor(role), req.nextUrl.origin));
    }
    if (isStudentRoute && role !== "STUDENT") {
      return NextResponse.redirect(new URL(homeFor(role), req.nextUrl.origin));
    }
    if (isAgentRoute && role !== "AGENT") {
      return NextResponse.redirect(new URL(homeFor(role), req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/app/:path*", "/agent/:path*"],
};
