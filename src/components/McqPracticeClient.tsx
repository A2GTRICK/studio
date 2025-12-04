// src/components/McqPracticeClient.tsx
"use client";
import React, { useMemo, useState } from "react";
import McqSetCard from "@/components/McqSetCard";
import { Loader2 } from "lucide-react";
import type { McqSet } from "@/types/mcq-set";

export function McqPracticeClient({ initialSets }: { initialSets: McqSet[] }) {
  const [mcqSets] = useState<McqSet[]>(initialSets);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    mcqSets.forEach((s) => set.add(s.course || "General"));
    return ["All", ...Array.from(set)];
  }, [mcqSets]);

  const filtered = useMemo(() => {
    let list = mcqSets;
    if (activeCategory && activeCategory !== "All") {
      list = list.filter((s) => (s.course || "General") === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description || "").toLowerCase().includes(q) ||
          (s.subject || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [mcqSets, activeCategory, query]);

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
          <div className="flex items-center gap-3">
             <div className="text-sm text-gray-500 hidden md:block">{filtered.length} sets</div>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === c ? "bg-purple-600 text-white shadow-md" : "bg-white border text-gray-700 hover:bg-purple-50"}`}>
                {c}
              </button>
            ))}
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-purple-200/80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description or subject..."
            className="w-full p-2.5 rounded-lg border-gray-200 focus:ring-purple-500 focus:border-purple-500 transition"
          />
        </div>

        {mcqSets.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-xl text-center shadow-sm border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">No MCQ Sets Found</h3>
              <p className="text-gray-500 mt-2">There are currently no published MCQ sets available.</p>
            </div>
        )}

        {mcqSets.length > 0 && filtered.length === 0 && (
            <div className="col-span-full bg-white p-8 rounded-xl text-center shadow-sm border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">No Matching MCQ Sets</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
        )}

        {filtered.length > 0 && (
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
                {filtered.map((set) => (
                    <McqSetCard key={set.id} set={set} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
