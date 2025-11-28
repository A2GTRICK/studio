// src/app/api/users/update/route.ts
import { NextResponse } from "next/server";
import { adminDb, adminFieldValue } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, displayName } = await req.json();
    if (!uid) return NextResponse.json({ ok: false, error: "Missing uid" }, { status: 400 });

    const ref = adminDb.collection("users").doc(uid);
    await ref.set(
      {
        displayName: displayName || null,
        updatedAt: adminFieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
