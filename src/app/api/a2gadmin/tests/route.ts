export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// -------------------------
// GET — List All Tests
// -------------------------
export async function GET() {
  try {
    const snap = await adminDb.collection("tests").orderBy("createdAt", "desc").get();
    const tests = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    return NextResponse.json({ tests });
  } catch (err: any) {
    console.error("TEST GET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// -------------------------
// POST — Create Test
// -------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      course,
      year,
      subject,
      description,
      difficulty,
      questions = [],
    } = body;

    const docRef = await adminDb.collection("tests").add({
      title,
      course,
      year,
      subject,
      description,
      difficulty,
      questions,
      createdAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err: any) {
    console.error("TEST POST ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// -------------------------
// PUT — Update Test
// -------------------------
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const updates = await req.json();

    await adminDb.collection("tests").doc(id).update({
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("TEST PUT ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// -------------------------
// DELETE — Remove Test
// -------------------------
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await adminDb.collection("tests").doc(id).delete();

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("TEST DELETE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
