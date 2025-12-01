// src/app/practice/test/[id]/instructions/page.tsx
import React from 'react';
import { fetchTestById } from '@/services/practice';
import Link from 'next/link';

export default async function Instructions({ params }: { params: { id: string } }) {
  const test = await fetchTestById(params.id);
  if (!test) return <div className="p-10">Test not found</div>;
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">{test.title}</h1>
      <p className="mt-3 text-gray-700">{test.description}</p>
      <div className="mt-6 space-y-3">
        <div>Duration: {test.durationMinutes} minutes</div>
        <div>Total questions: {test.totalQuestions}</div>
      </div>
      <div className="mt-8">
        <Link href={`/practice/test/${test.id}/player`} className="px-6 py-3 bg-purple-600 text-white rounded">Begin Test</Link>
      </div>
    </div>
  );
}
