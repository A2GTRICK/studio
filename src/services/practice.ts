import { db } from "@/firebase/config";  
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Example function
export async function fetchTests() {
  const q = query(collection(db, "tests"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
