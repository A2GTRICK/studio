
import { NextResponse } from "next/server";
import { adminDb, adminFieldValue } from "@/lib/firebaseAdmin"; 
import { collection, addDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      course,
      year,
      subject,
      thumbnail,
      isPremium,
      content,
      driveLink,
    } = body;

    // Validate required fields
    if (!title || !course || !year || !subject) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Add to Firestore using the Admin SDK
    await addDoc(collection(adminDb, "notes"), {
      title,
      course,
      year,
      subject,
      thumbnail: thumbnail || "",
      isPremium: Boolean(isPremium),
      content: content || "",
      driveLink: driveLink || "",
      createdAt: adminFieldValue.serverTimestamp(),
      updatedAt: adminFieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}
