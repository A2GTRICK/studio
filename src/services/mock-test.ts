import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

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
  const snap = await getDocs(collection(db, "test_series"));

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));
}
