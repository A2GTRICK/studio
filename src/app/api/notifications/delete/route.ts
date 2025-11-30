import { NextResponse } from "next/server";
import { adminDb } from "@/firebase/admin";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    await adminDb.collection("custom_notifications").doc(id).delete();

    return NextResponse.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("API Delete Notification Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
