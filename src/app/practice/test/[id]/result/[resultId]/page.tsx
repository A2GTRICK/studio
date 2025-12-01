// src/app/practice/test/[id]/result/[resultId]/page.tsx
import React from 'react';
import { adminDb } from '@/lib/firebaseAdmin'; // server-only

export default async function ResultPage({ params }: { params: { id: string, resultId: string }}) {
  const resDoc = await adminDb.collection('results').doc(params.resultId).get();
  if (!resDoc.exists) return <div className="p-10">Result not found</div>;
  const data = resDoc.data();

  if(!data) return <div className="p-10">Result not found</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Your Result</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded">
          <div className="text-sm">Score</div>
          <div className="text-3xl font-extrabold">{data.score} / {data.totalMarks}</div>
        </div>
        <div className="p-6 border rounded">
          <div>Correct: {data.correctCount}</div>
          <div>Incorrect: {data.incorrectCount}</div>
          <div>Skipped: {data.skippedCount}</div>
        </div>
        <div className="p-6 border rounded">
          <div>Percentile: {data.percentile ?? '-'}</div>
          <div>Accuracy: {data.accuracy}%</div>
          <div>Time: {Math.round((data.timeTakenSeconds ?? 0)/60)} mins</div>
        </div>
      </div>

      {/* Recommended Notes */}
      {data.recommendedNotes?.length > 0 && (
        <div className="mt-10">
          <h3 className="font-bold text-xl">Recommended Notes for you</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {data.recommendedNotes.map((n:any)=>(
              <a key={n.id} href={`/dashboard/notes/view/${n.id}`} className="p-4 border rounded">
                <h4 className="font-semibold">{n.title}</h4>
                <p className="text-sm text-gray-600">{n.course} • {n.subject}</p>
              </a>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
