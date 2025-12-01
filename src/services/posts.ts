
import { db } from "@/firebase/config";
import { collection, getDocs, doc, getDoc, orderBy, query } from "firebase/firestore";

export async function fetchAllPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchSinglePost(id: string) {
  const ref = doc(db, "posts", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}
