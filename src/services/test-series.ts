// src/services/test-series.ts
import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export type TestSeriesQuestion = {
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
  explanation?: string;
};

export type TestSeries = {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  testType?: string;
  duration?: number;
  isPremium?: boolean;
  questions: TestSeriesQuestion[];
  createdAt?: any;
};

const COL = "test_series";

/**
 * Fetch all published mock tests for dashboard
 */
export async function fetchPublishedTestSeries(): Promise<TestSeries[]> {
  const q = query(
    collection(db, COL),
    where("testType", "==", "Mock test"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  const arr: TestSeries[] = [];

  snap.forEach((doc) => {
    arr.push({
      id: doc.id,
      ...(doc.data() as any),
    });
  });

  return arr;
}
