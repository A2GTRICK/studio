// src/app/api/a2gadmin/notes/route.ts
'use server';

import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isAdminAuthenticated } from "@/lib/verifyAdminSession";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

// GET all or a single note
export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Get single document
      const docRef = adminDb.collection("notes").doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }
      return NextResponse.json({ note: { id: docSnap.id, ...docSnap.data() } });
    }

    // Get all documents
    const snapshot = await adminDb.collection("notes").orderBy("createdAt", "desc").get();
    const notes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ notes });

  } catch (err: any) {
    console.error("Admin GET notes error:", err);
    return NextResponse.json({ error: "Server error occurred while fetching notes" }, { status: 500 });
  }
}

// CREATE a new note
export async function POST(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const payload = await req.json();

    const newDoc = await adminDb.collection("notes").add({
      ...payload,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ id: newDoc.id }, { status: 201 });
  } catch (err: any) {
    console.error("Admin POST notes error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

// UPDATE an existing note
export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Note ID is required for update." }, { status: 400 });
    }

    const payload = await req.json();
    
    const docRef = adminDb.collection("notes").doc(id);

    await docRef.update({
      ...payload,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ id, message: "Note updated successfully" });

  } catch (err: any) {
    console.error("Admin PUT notes error:", err);
    return NextResponse.json({ error: "Server error during note update." }, { status: 500 });
  }
}


// DELETE a note
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Note ID is required for deletion." }, { status: 400 });
    }

    await adminDb.collection("notes").doc(id).delete();
    return NextResponse.json({ message: "Note deleted successfully" });

  } catch (err: any) {
    console.error("Admin DELETE notes error:", err);
    return NextResponse.json({ error: "Server error during note deletion." }, { status: 500 });
  }
}
