
import { db } from "@/firebase/config";  
import { collection, addDoc, getDocs, getDoc, query, where, doc } from "firebase/firestore";

// Example function
export async function fetchAllTests() {
  const q = query(collection(db, "tests"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchTestById(id: string) {
    const docRef = doc(db, "tests", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
}

export async function fetchTestQuestions(testId: string) {
    const q = query(collection(db, `tests/${testId}/questions`));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}


export async function fetchTestResult(resultId: string) {
    const res = await fetch(`/api/practice/result?id=${resultId}`, {
        method: "GET",
        cache: "no-store",
      });
      return res.json();
}
