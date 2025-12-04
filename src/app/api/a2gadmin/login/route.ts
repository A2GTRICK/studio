import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ message: "Password required" }, { status: 400 });
    }

    // Use a single, reliable secret from environment variables.
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      console.error("ADMIN_SECRET is not set in the environment variables.");
      return NextResponse.json({ message: "Admin authentication is not configured on the server." }, { status: 500 });
    }

    if (password === adminSecret) {
      // Password is correct, create a session cookie.
      const token = randomBytes(32).toString("hex");
      const res = NextResponse.json({ success: true });

      res.cookies.set("a2g_admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return res;
    }

    // Incorrect password.
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });

  } catch (err: any) {
    console.error("Admin Login API Error:", err);
    return NextResponse.json({ message: "An unexpected server error occurred." }, { status: 500 });
  }
}
