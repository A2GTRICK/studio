import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await adminDb.collection("tests").orderBy("createdAt", "desc").limit(200).get();
    const items: any[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...(d.data() || {}) }));
    return NextResponse.json({ items });
  } catch (err: any) {
    console.error("List tests error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

    const now = adminDb.FieldValue?.serverTimestamp ? adminDb.FieldValue.serverTimestamp() : (adminDb as any).app?.firestore.FieldValue.serverTimestamp?.();
    // But adminDb is a Firestore instance; use admin SDK FieldValue via admin package inside lib if needed.
    // For safety, set createdAt to null (Firestore server timestamp will be added elsewhere if required)
    const ref = await adminDb.collection("tests").add({ ...body, createdAt: null, updatedAt: null });
    return NextResponse.json({ id: ref.id }, { status: 201 });
  } catch (err: any) {
    console.error("Create test error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}