
'use server';

import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface NoteInfo {
  id: string;
  course?: string;
  subject?: string;
  year?: string;
}

/**
 * Tracks a note view event for analytics.
 * This function fails silently and logs errors to the console
 * to avoid impacting the user experience.
 *
 * @param userId - The ID of the user viewing the note.
 * @param note - An object containing information about the note being viewed.
 */
export async function trackNoteView(userId: string, note: NoteInfo): Promise<void> {
  if (!userId || !note || !note.id) {
    return;
  }

  try {
    const viewsCollection = collection(db, "note_views");
    await addDoc(viewsCollection, {
      userId: userId,
      noteId: note.id,
      course: note.course || null,
      subject: note.subject || null,
      year: note.year || null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to track note view:", error);
    // This function fails silently on purpose.
  }
}
