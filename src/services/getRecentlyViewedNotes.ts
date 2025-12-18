
import { db } from "@/firebase/config";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";

interface RecentlyViewedNote {
  id: string;
  title: string;
  course?: string;
  subject?: string;
  year?: string;
}

/**
 * Fetches the most recently viewed notes for a given user.
 * 
 * @param userId The ID of the user.
 * @param limitCount The maximum number of notes to return. Defaults to 5.
 * @returns A promise that resolves to an array of recently viewed note objects.
 */
export async function getRecentlyViewedNotes(
  userId: string,
  limitCount: number = 5
): Promise<RecentlyViewedNote[]> {
  if (!userId) {
    return [];
  }

  try {
    const viewsCollection = collection(db, "note_views");
    const q = query(
      viewsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const viewSnapshot = await getDocs(q);
    if (viewSnapshot.empty) {
      return [];
    }

    const notePromises = viewSnapshot.docs.map(viewDoc => {
        const noteId = viewDoc.data().noteId;
        if (typeof noteId !== 'string') {
            return null;
        }
        const noteRef = doc(db, "notes", noteId);
        return getDoc(noteRef);
    }).filter(promise => promise !== null);

    const noteSnapshots = await Promise.all(notePromises as Promise<import("firebase/firestore").DocumentSnapshot>[]);

    const recentNotes = noteSnapshots.map(noteSnap => {
        if (noteSnap.exists()) {
            const data = noteSnap.data();
            return {
                id: noteSnap.id,
                title: data.title || "Untitled Note",
                course: data.course,
                subject: data.subject,
                year: data.year,
            };
        }
        return null;
    }).filter((note): note is RecentlyViewedNote => note !== null);
    
    // De-duplicate in case user viewed the same note multiple times recently
    const uniqueNotes = Array.from(new Map(recentNotes.map(note => [note.id, note])).values());

    return uniqueNotes;

  } catch (error) {
    console.error("Error fetching recently viewed notes:", error);
    // Fail silently on error to avoid impacting UX
    return [];
  }
}
