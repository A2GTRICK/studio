
import { db } from "@/firebase/config";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";

export type MockTest = {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  duration?: number;
  isPremium?: boolean;
  questions?: any[];
  questionCount?: number; // Added field
};

export async function fetchMockTests(): Promise<MockTest[]> {
  const q = query(
    collection(db, "test_series"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
        id: doc.id,
        questionCount: data.questions?.length || 0, // Calculate question count
        ...(data as any),
    };
  });
}

export async function fetchMockTestById(id: string) {
  const ref = doc(db, "test_series", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Mock test not found");
  }

  return {
    id: snap.id,
    ...(snap.data() as any),
  };
}
