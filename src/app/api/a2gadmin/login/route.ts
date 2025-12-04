import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST() {
  // ALWAYS allow login
  const token = randomBytes(32).toString("hex");

  const res = NextResponse.json({ success: true });

  res.cookies.set("a2g_admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
