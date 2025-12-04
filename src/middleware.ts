import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge-safe middleware — only checks cookie.
 * Protects /a2gadmin/** routes (redirects to login when missing cookie)
 */
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect /a2gadmin except login/logout
  const isAdminArea = path.startsWith("/a2gadmin");
  const isPublic = path === "/a2gadmin/login" || path === "/a2gadmin/logout";

  if (isAdminArea && !isPublic) {
    const session = req.cookies.get("a2g_admin_session")?.value;
    if (!session) {
      const loginUrl = new URL("/a2gadmin/login", req.url);
      loginUrl.searchParams.set("from", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/a2gadmin/:path*"],
};