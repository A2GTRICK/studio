
import { db } from "@/firebase/config";
import { collection, getDocs, doc, getDoc, orderBy, query, Timestamp, where } from "firebase/firestore";

export interface Post {
    id: string;
    title: string;
    slug?: string; // Added slug field
    summary: string;
    content: string;
    category: string;
    banner?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export async function fetchAllPosts(): Promise<Post[]> {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
}

// Updated to fetch by slug primarily, falling back to ID.
export async function fetchSinglePost(slugOrId: string): Promise<Post | null> {
  // 1. Try to fetch by slug first
  const q = query(collection(db, "posts"), where("slug", "==", slugOrId));
  const slugSnap = await getDocs(q);

  if (!slugSnap.empty) {
    const postDoc = slugSnap.docs[0];
    return { id: postDoc.id, ...postDoc.data() } as Post;
  }
  
  // 2. If not found by slug, try to fetch by ID (for backwards compatibility)
  try {
    const ref = doc(db, "posts", slugOrId);
    const idSnap = await getDoc(ref);

    if (idSnap.exists()) {
      return { id: idSnap.id, ...idSnap.data() } as Post;
    }
  } catch(e) {
      // This can happen if slugOrId is not a valid document ID path segment.
      // We can ignore this error because we already tried fetching by slug.
  }

  // 3. If neither works, return null
  return null;
}
