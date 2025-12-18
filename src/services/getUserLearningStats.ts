import { db } from "@/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export interface UserLearningStats {
  totalNotesViewed: number;
  subjectsExplored: number;
  mostViewedSubject: string | null;
  lastActiveAt: Date | null;
}

/**
 * Fetches high-level learning insights for a user.
 * Read-only, non-blocking, and production-safe.
 */
export async function getUserLearningStats(
  userId: string
): Promise<UserLearningStats> {
  if (!userId) {
    return {
      totalNotesViewed: 0,
      subjectsExplored: 0,
      mostViewedSubject: null,
      lastActiveAt: null,
    };
  }

  try {
    const q = query(
      collection(db, "note_views"),
      where("userId", "==", userId)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return {
        totalNotesViewed: 0,
        subjectsExplored: 0,
        mostViewedSubject: null,
        lastActiveAt: null,
      };
    }

    const subjectCount: Record<string, number> = {};
    let lastActive: Date | null = null;

    snap.docs.forEach((doc) => {
      const data = doc.data();

      if (data.subject) {
        subjectCount[data.subject] =
          (subjectCount[data.subject] || 0) + 1;
      }

      const ts = data.createdAt as Timestamp | undefined;
      if (ts) {
        const date = ts.toDate();
        if (!lastActive || date > lastActive) {
          lastActive = date;
        }
      }
    });

    const mostViewedSubject =
      Object.entries(subjectCount).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ?? null;

    return {
      totalNotesViewed: snap.size,
      subjectsExplored: Object.keys(subjectCount).length,
      mostViewedSubject,
      lastActiveAt: lastActive,
    };
  } catch (err) {
    console.error("getUserLearningStats failed:", err);
    return {
      totalNotesViewed: 0,
      subjectsExplored: 0,
      mostViewedSubject: null,
      lastActiveAt: null,
    };
  }
}
