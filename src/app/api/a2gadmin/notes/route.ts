
// src/app/api/a2gadmin/notes/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { fetchAllNotes } from "@/services/notes";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";


/* ------------------------
   GET — list notes OR get single note (admin)
   ------------------------ */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
    // If an ID is provided, fetch a single note
    if (id) {
        const noteRef = doc(db, "notes", id);
        const noteSnap = await getDoc(noteRef);

        if (!noteSnap.exists()) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }
        
        const noteData = noteSnap.data();
        const note = {
            id: noteSnap.id,
            ...noteData,
            createdAt: noteData.createdAt?.toDate ? noteData.createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: noteData.updatedAt?.toDate ? noteData.updatedAt.toDate().toISOString() : null,
        }

        return NextResponse.json({ note });
    }

    // Otherwise, fetch all notes using the reliable client-sdk service
    const notes = await fetchAllNotes();
    return NextResponse.json({ notes });

  } catch (err: any) {
    console.error("Admin GET notes error:", err);
    return NextResponse.json(
      {
        error: "Server error occurred while fetching notes",
        message: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

// NOTE: POST, PUT, DELETE operations have been removed as they were not being used
// and keeping them would require a more complex admin-sdk setup.
// The app currently uses client-side mutations from the admin pages directly.
