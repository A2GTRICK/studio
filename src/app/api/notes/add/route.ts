
import { NextResponse } from "next/server";
import { db } from "@/firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    // Add to Firestore
    await addDoc(collection(db, "notes"), {
      title,
      course,
      year,
      subject,
      thumbnail: thumbnail || "",
      isPremium: Boolean(isPremium),
      content: content || "",
      driveLink: driveLink || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // IMPORTANT FIX:
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      { success: false, message: "Server error." },
      { status: 500 }
    );
  }
}
