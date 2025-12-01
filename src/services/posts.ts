
import { db } from "@/firebase/config";
import { collection, getDocs, doc, getDoc, orderBy, query, Timestamp } from "firebase/firestore";

export interface Post {
    id: string;
    title: string;
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

export async function fetchSinglePost(id: string): Promise<Post | null> {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() } as Post;
}
