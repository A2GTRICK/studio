export const dynamic = "force-dynamic";

// src/app/practice/page.tsx (Server Component)
import React from 'react';
import { fetchAllTests } from '@/services/practice';
import Link from 'next/link';

export default async function PracticeIndex() {
  const tests = await fetchAllTests();
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Practice Zone</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map(t => (
          <div key={t.id} className="p-6 rounded-xl shadow-sm border bg-white">
            <h2 className="text-xl font-semibold">{t.title}</h2>
            <p className="text-sm mt-2 text-gray-600">{t.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Duration: {t.durationMinutes} mins</div>
              <Link href={`/practice/test/${t.id}/instructions`} className="px-4 py-2 bg-purple-600 text-white rounded">Start</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
