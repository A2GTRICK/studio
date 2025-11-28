
// src/app/api/users/create/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminFieldValue } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, displayName, email } = await req.json();
    if (!uid) return NextResponse.json({ ok: false, error: "No UID" }, { status: 400 });

    const ref = adminDb.collection("users").doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        displayName: displayName || null,
        email: email || null,
        role: "student", // default role
        createdAt: adminFieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("User create error", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
