// src/services/practice.ts
import { db } from '@/firebase/config';
import { collection, doc, getDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { Test, Question } from '@/types/practice';

export async function fetchAllTests(): Promise<Test[]> {
  const q = query(collection(db, 'tests'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Test));
}

export async function fetchTestById(id: string): Promise<Test | null> {
  const d = await getDoc(doc(db, 'tests', id));
  if (!d.exists()) return null;
  return { id: d.id, ...(d.data() as any) } as Test;
}

export async function fetchTestQuestions(testId: string): Promise<Question[]> {
  const q = query(collection(db, `tests/${testId}/questions`), orderBy('section'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Question));
}
