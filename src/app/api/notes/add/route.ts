// src/app/api/notes/add/route.ts
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
        driveLink 
    } = body;
    
    if (!title || !course || !year || !subject) {
        return NextResponse.json({ success: false, message: "Required fields are missing." }, { status: 400 });
    }

    // create firestore document
    const docRef = await addDoc(collection(db, "notes"), {
      title,
      subject,
      course,
      year,
      content: content || "",
      isPremium: isPremium || false,
      thumbnail: thumbnail || "",
      driveLink: driveLink || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Add Note API error:", err);
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
