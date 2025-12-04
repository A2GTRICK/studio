// src/app/dashboard/mcq-practice/page.tsx (Server Component)
import React from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { McqPracticeClient } from '@/components/McqPracticeClient';
import type { McqSet } from '@/types/mcq-set';

// Helper to safely convert Firestore timestamps to serializable dates
function processFirestoreData(docs: any[]): McqSet[] {
  return docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
    };
  });
}

async function getPublishedMcqSets(): Promise<McqSet[]> {
    try {
        const setsRef = collection(db, "mcqSets");
        const q = query(setsRef, where("isPublished", "==", true), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const sets = processFirestoreData(querySnapshot.docs);
        return sets;
    } catch (error) {
        console.error("Failed to fetch published MCQ sets:", error);
        return []; // Return empty array on error
    }
}

export default async function MCQPracticePage() {
  const mcqSets = await getPublishedMcqSets();

  return <McqPracticeClient initialSets={mcqSets} />;
}
