"use client";

import { useSearchParams } from "next/navigation";

export default function ViewNotePage() {
  const params = useSearchParams();
  const title = params.get("title");
  const short = params.get("short");
  const content = params.get("content");

  return (
    <div className="space-y-8">

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-gray-600 mt-1">{short}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border leading-7">
        <h2 className="text-xl font-semibold mb-3">Full Notes</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {content || "Full note content goes here."}
        </p>
      </div>

      <a href="/dashboard/notes" className="text-blue-600 font-semibold">
        ← Back to Notes Library
      </a>
    </div>
  );
}