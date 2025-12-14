// src/services/mock-test.ts
"use client";

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
  totalQuestions?: number;
  totalTime?: number; // minutes
  isPublished: boolean;
  createdAt?: any;
};

// USER SIDE — READ ONLY PUBLISHED MOCK TESTS
export async function fetchPublishedMockTests(): Promise<MockTest[]> {
  const q = query(
    collection(db, "mockTests"),
    where("isPublished", "==", true),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  const arr: MockTest[] = [];

  snap.forEach((doc) => {
    arr.push(doc.data() as MockTest);
  });

  return arr;
}
