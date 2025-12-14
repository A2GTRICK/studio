
import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export type MockTest = {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  course?: string;
  duration?: number;
  questions: any[];
  isPremium?: boolean;
  createdAt?: any;
};

export async function fetchMockTests(): Promise<MockTest[]> {
  const q = query(
    collection(db, "test_series"),
    where("testType", "==", "Mock Test"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));
}
