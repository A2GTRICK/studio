// src/app/practice/test/[id]/result/[resultId]/page.tsx
import React from 'react';
import { fetchTestById, fetchTestResult } from '@/services/practice';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ResultPage({ params }: { params: { id: string, resultId: string }}) {
  const [test, result] = await Promise.all([
    fetchTestById(params.id),
    fetchTestResult(params.resultId)
  ]);
  
  if (!test || !result) return notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Your Result for: {test.title}</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="text-sm text-gray-500">Score</div>
          <div className="text-4xl font-extrabold text-purple-700">{result.score} / {result.totalMarks}</div>
        </div>
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="text-sm text-gray-500">Breakdown</div>
          <div className="mt-2 space-y-1 text-md">
              <div>Correct: <span className="font-semibold text-green-600">{result.correctCount}</span></div>
              <div>Incorrect: <span className="font-semibold text-red-600">{result.incorrectCount}</span></div>
              <div>Skipped: <span className="font-semibold text-gray-600">{result.skippedCount}</span></div>
          </div>
        </div>
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <div className="text-sm text-gray-500">Performance</div>
           <div className="mt-2 space-y-1 text-md">
              <div>Percentile: <span className="font-semibold text-blue-600">{result.percentile ?? '-'}%</span></div>
              <div>Accuracy: <span className="font-semibold text-blue-600">{result.accuracy}%</span></div>
              <div>Time: <span className="font-semibold text-gray-600">{Math.round((result.timeTakenSeconds ?? 0)/60)} mins</span></div>
          </div>
        </div>
      </div>

      {result.recommendedNotes?.length > 0 && (
        <div className="mt-12">
          <h3 className="font-bold text-2xl">Recommended Notes for you</h3>
          <p className="text-gray-600">Based on your performance, you should review these topics.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {result.recommendedNotes.map((n:any)=>(
              <Link key={n.id} href={`/dashboard/notes/view/${n.id}`} className="p-4 border rounded-lg bg-white hover:shadow-lg transition-shadow">
                <h4 className="font-semibold text-purple-800">{n.title}</h4>
                <p className="text-sm text-gray-600">{n.course} • {n.subject}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
