import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id)
      return NextResponse.json({ error: "Missing test id" }, { status: 400 });

    const docRef = adminDb.collection("tests").doc(id);
    const snap = await docRef.get();

    if (!snap.exists)
      return NextResponse.json({ error: "Test not found" }, { status: 404 });

    const current = snap.data()?.published || false;
    const updated = !current;

    await docRef.update({
      published: updated,
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true, published: updated });
  } catch (err: any) {
    console.error("Publish toggle error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
