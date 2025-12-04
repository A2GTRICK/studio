import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { testId, sections } = body || {};
    if (!testId || !sections) return NextResponse.json({ error: "Missing testId or sections" }, { status: 400 });

    const testRef = adminDb.collection("tests").doc(testId);
    const batch = adminDb.batch();

    for (const s of sections) {
      const secDoc = testRef.collection("sections").doc();
      batch.set(secDoc, { title: s.title || "Section", time: s.time || null, createdAt: null });

      const questionsRef = secDoc.collection("questions");
      for (const q of s.questions || []) {
        const qDoc = questionsRef.doc();
        batch.set(qDoc, {
          text: q.text || q.question || "",
          type: q.type || "single",
          marks: q.marks ?? 1,
          negative: q.negative ?? 0,
          options: q.options || [],
          answer: q.answer ?? null,
          explanation: q.explanation || "",
          createdAt: null,
        });
      }
    }

    await batch.commit();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Bulk upload error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}