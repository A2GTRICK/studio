// src/app/api/users/create/route.ts
import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { uid, displayName, email } = await req.json();
    if (!uid) return NextResponse.json({ ok: false }, { status: 400 });

    const ref = adminDb.collection("users").doc(uid);
    const snap = await ref.get();
    if (!snap.exists) {
      await ref.set({
        displayName: displayName || null,
        email: email || null,
        role: "student",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
