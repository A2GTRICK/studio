// src/app/practice/premium/page.tsx
import React from "react";
import Link from "next/link";
import { db } from "@/firebase/config"; // existing client config used for server reads
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import MCQCard from "@/components/practice-premium/MCQCard";
import FilterBar from "@/components/practice-premium/FilterBar";
import HistoryWidget from "@/components/practice-premium/HistoryWidget";

export default async function PremiumPracticePage() {
  // server-side read: only metadata, avoid answers
  const ref = collection(db, "mcqSets");
  // A where clause on a field that doesn't exist on all documents will filter them out. 
  // Let's query without it for now to ensure all sets are fetched.
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  
  const sets = snap.docs.map(d => {
    const data = d.data();
    return { 
      id: d.id, 
      ...data,
      // Convert Timestamps to serializable format (ISO string)
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null,
    };
  });

  return (
    <div className="min-h-screen bg-[#F5F1FF] pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-[#6B21A8]">A2G — MCQ Practice (Premium)</h1>
          <div className="space-x-3">
            <Link href="/practice" className="px-4 py-2 border rounded-lg">Classic Practice</Link>
            <Link href="/dashboard" className="px-4 py-2 bg-[#6B21A8] text-white rounded-lg">Dashboard</Link>
          </div>
        </header>

        <div className="lg:flex gap-8">
          {/* main */}
          <main className="flex-1">
            <FilterBar />

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {sets.map((s:any) => (
                <MCQCard key={s.id} set={s} />
              ))}
            </div>
          </main>

          {/* right sidebar */}
          <aside className="w-80 hidden lg:block">
            <div className="sticky top-20 space-y-6">
              <HistoryWidget />
              <div className="p-4 bg-white rounded-2xl shadow border">
                <h4 className="font-bold text-[#6B21A8]">Premium Perks</h4>
                <ul className="mt-2 text-sm text-gray-700 space-y-2">
                  <li>• Sample questions preview</li>
                  <li>• Test insights & analytics</li>
                  <li>• Resume unfinished tests</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
