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
 * Fails silently to avoid impacting UX.
 */
export async function trackNoteView(
  userId: string,
  note: NoteInfo
): Promise<void> {
  if (!userId || !note?.id) return;

  try {
    await addDoc(collection(db, "note_views"), {
      userId,
      noteId: note.id,
      course: note.course ?? null,
      subject: note.subject ?? null,
      year: note.year ?? null,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("trackNoteView failed:", err);
  }
}
