import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, summary, category, link } = body;

    if (!title || !summary || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection("custom_notifications").add({
      title,
      summary,
      category,
      link: link || null,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err: any) {
    console.error("CREATE notification error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
