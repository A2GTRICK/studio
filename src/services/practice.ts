
import { db } from "@/firebase/config";  
import { collection, addDoc, getDocs, getDoc, query, where, doc } from "firebase/firestore";

// Example function
export async function fetchAllTests() {
  const q = query(collection(db, "tests"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function fetchTestById(id: string) {
    const docRef = doc(db, "test_series", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return { 
            id: docSnap.id,
            ...data,
            durationMinutes: data.duration, // map duration to durationMinutes
            totalQuestions: data.questions?.length || 0,
        };
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
