
// src/components/practice-premium/HistoryWidget.tsx
"use client";
import React, { useEffect, useState } from "react";

export default function HistoryWidget() {
  const [history, setHistory] = useState<any[]>([]);
  useEffect(()=> {
    // try to read last attempts locally for guest or call API for logged user
    const attempts = JSON.parse(localStorage.getItem("a2g_recent_attempts") || "[]");
    setHistory(attempts.slice(0,5));
  },[]);
  return (
    <div className="p-4 bg-white rounded-2xl shadow border">
      <h4 className="font-bold text-[#6B21A8]">Recent Attempts</h4>
      {history.length===0 ? <p className="text-sm text-gray-600 mt-2">No attempts yet</p> :
        <ul className="mt-2 space-y-2 text-sm">
          {history.map((h:any, idx:number)=>
            <li key={idx} className="flex justify-between">
              <span>{h.title || h.id}</span>
              <span className="text-gray-500">{h.score ?? "-"}</span>
            </li>
          )}
        </ul>
      }
    </div>
  );
}
