import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

    // ENV secret (fast dev login) OR Firestore adminConfig/main.adminCode
    const ENV_SECRET = process.env.ADMIN_SECRET || "";
    if (ENV_SECRET && password === ENV_SECRET) {
      const token = randomBytes(32).toString("hex");
      const res = NextResponse.json({ ok: true });
      res.cookies.set("a2g_admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    // fallback: read adminConfig/main from Firestore
    const snap = await adminDb.collection("adminConfig").doc("main").get();
    const cfg = snap.exists ? snap.data() : null;
    const stored = cfg?.adminCode;
    const enabled = cfg?.enabled ?? true;

    if (!enabled) return NextResponse.json({ error: "Admin disabled" }, { status: 403 });
    if (!stored || password !== stored) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const token = randomBytes(32).toString("hex");
    const res = NextResponse.json({ ok: true });
    res.cookies.set("a2g_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;

  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}