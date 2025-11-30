import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, summary, category, link } = body;

    if (!title || !summary || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notification = {
      title,
      summary,
      category,
      link: link || null,
      createdAt: Timestamp.now(),
    };

    const docRef = await adminDb.collection("custom_notifications").add(notification);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("API Create Notification Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
