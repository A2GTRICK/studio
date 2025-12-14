import { db } from "@/firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export type MockTest = {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  duration?: number;
  isPremium?: boolean;
  questions?: any[];
};

export async function fetchMockTests(): Promise<MockTest[]> {
  const q = query(
    collection(db, "test_series"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));
}
