
import React from 'react';
import McqSetCard from "@/components/McqSetCard";
import { Loader2 } from "lucide-react";
import type { McqSet } from "@/types/mcq-set";
import McqPracticeClient from "@/components/McqPracticeClient";
import { adminDb } from '@/lib/firebaseAdmin';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';

async function getPublishedMcqSets(): Promise<McqSet[]> {
    try {
        const setsRef = collection(adminDb, 'mcqSets');
        const q = query(setsRef, where("isPublished", "==", true), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return [];
        }

        // Manually convert Timestamp to a serializable format (milliseconds)
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const plainData: any = { id: doc.id };
            for (const key in data) {
                const value = data[key];
                if (value instanceof Timestamp) {
                    plainData[key] = value.toMillis();
                } else {
                    plainData[key] = value;
                }
            }
            return plainData as McqSet;
        });

    } catch (error) {
        console.error("Error fetching published MCQ sets on server:", error);
        return [];
    }
}


export default async function McqPracticePage() {
  
  const initialSets = await getPublishedMcqSets();

  return (
    <div className="min-h-screen bg-[#F3EBFF] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3 text-gray-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white">🧪</span>
              MCQ Practice
            </h1>
            <p className="text-sm text-gray-600 mt-1">Practice important questions and improve your performance.</p>
          </div>
        </header>
        
        <McqPracticeClient initialSets={initialSets} />

      </div>
    </div>
  );
}
