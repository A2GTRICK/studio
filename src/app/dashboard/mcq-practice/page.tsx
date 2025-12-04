// src/app/dashboard/mcq-practice/page.tsx (Server Component)
import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import { McqPracticeClient } from '@/components/McqPracticeClient';
import type { McqSet } from '@/types/mcq-set';

// Helper to safely convert Firestore timestamps to serializable dates
function processFirestoreData(docs: FirebaseFirestore.QueryDocumentSnapshot[]): McqSet[] {
  return docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
    } as McqSet;
  });
}

async function getPublishedMcqSets(): Promise<McqSet[]> {
    try {
        const setsRef = adminDb.collection("mcqSets");
        const q = setsRef.where("isPublished", "==", true).orderBy("createdAt", "desc");
        const querySnapshot = await q.get();
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
