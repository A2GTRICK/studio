import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get("a2g_admin_session");

  // Allow API routes, static files, and image optimization to pass through
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".") // e.g., /favicon.ico
  ) {
    return NextResponse.next();
  }

  // If trying to access admin area without a session, redirect to login
  if (pathname.startsWith("/a2gadmin") && !pathname.startsWith("/a2gadmin/login") && !session) {
    const loginUrl = new URL("/a2gadmin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If on login page with a session, redirect to admin dashboard
  if (pathname.startsWith("/a2gadmin/login") && session) {
    const adminUrl = new URL("/a2gadmin", req.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except the ones explicitly allowed in the middleware
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
