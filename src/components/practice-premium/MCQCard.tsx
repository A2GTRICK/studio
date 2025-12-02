
// src/components/practice-premium/MCQCard.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import PreviewModal from "./PreviewModal";

export default function MCQCard({ set }: any) {
  const [open, setOpen] = useState(false);
  const durationMin = Math.round((set.testDuration || 600) / 60);

  // Respect client filter events (URL)
  useEffect(()=> {
    const onFilter = () => {
      // read URL params and optionally hide card if it doesn't match
      // keep simple: no hide logic here; advanced filtering can be added later.
    };
    window.addEventListener("a2g:mcq-filter-changed", onFilter);
    return ()=> window.removeEventListener("a2g:mcq-filter-changed", onFilter);
  }, []);

  return (
    <>
      <article className="p-4 bg-white rounded-2xl shadow border">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#4C1D95]">{set.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{set.subject} • Year {set.year}</p>
            <div className="text-xs text-gray-500 mt-2">{set.tags?.slice?.(0,3)?.join(", ")}</div>
          </div>
          <div className="text-right">
            {set.isPremium && <span className="px-2 py-1 text-xs bg-yellow-100 rounded font-semibold">Premium</span>}
            <div className="text-sm mt-2">{set.questionCount || "—"} Q</div>
            <div className="text-sm">{durationMin} min</div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={()=>setOpen(true)} className="px-3 py-2 border rounded">Preview</button>
          <Link href={`/practice/test/${set.id}/instructions`} className="px-3 py-2 bg-[#6B21A8] text-white rounded">Start</Link>
          <button onClick={() => { localStorage.setItem("a2g_resume_"+set.id, JSON.stringify({ id: set.id, ts: Date.now() })); alert("Saved quick resume"); }} className="px-3 py-2 border rounded">Save</button>
        </div>
      </article>

      {open && <PreviewModal setId={set.id} onClose={()=>setOpen(false)} />}
    </>
  );
}
