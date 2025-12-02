// src/components/practice-premium/PreviewModal.tsx
"use client";
import React, { useEffect, useState } from "react";

export default function PreviewModal({ setId, onClose }: any) {
  const [sample, setSample] = useState<any[]>([]);
  useEffect(()=> {
    // Fetch 1-2 sample questions from server API (do not expose answers)
    fetch(`/api/getMcqSetSample?setId=${setId}`)
      .then(r=>r.json())
      .then(j=> setSample(j.questions || []))
      .catch(()=> setSample([]));
  },[setId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[min(900px,95%)] bg-white rounded-2xl p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Sample Questions</h3>
          <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
        </div>
        <div className="mt-4 space-y-4">
          {sample.length===0 && <p className="text-gray-600">No preview available.</p>}
          {sample.map((q:any, i:number)=>(
            <div key={i} className="p-3 border rounded">
              <div className="font-medium">{i+1}. {q.question}</div>
              <ul className="mt-2 text-sm space-y-1">
                {(q.options||[]).map((o:any, idx:number)=> <li key={idx} className="ml-3">• {o}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
