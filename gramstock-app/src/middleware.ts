import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ==============================================================================
// GRAMSTOCK CLOUD — AUTHENTICATION GUARD MIDDLEWARE
// Enforces mandatory authentication for all application and tenant routes.
// Unauthenticated visitors are immediately redirected to /login with state preserved.
// ==============================================================================

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/inventory",
  "/imports",
  "/reports",
  "/audit",
  "/sla",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const sessionToken = request.cookies.get("gs_session")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    "/imports/:path*",
    "/reports/:path*",
    "/audit/:path*",
    "/sla/:path*",
  ],
};
