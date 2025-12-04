"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function McqPracticeHome() {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSets() {
      try {
        const res = await fetch("/api/a2gadmin/mcq");
        const data = await res.json();

        // FIX: The API returns `data.sets`, not `data.mcqSets`.
        const allSets = data.sets || [];

        const onlyPublished = allSets.filter(
          (s: any) => s.isPublished === true
        );

        setSets(onlyPublished);
      } catch (err) {
        console.error("Error loading MCQ sets:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSets();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="text-center p-8 text-gray-600 font-medium">
        No published MCQ sets found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MCQ Practice</h1>

      <div className="grid md:grid-cols-2 gap-5">
        {sets.map((set: any) => (
          <Link
            key={set.id}
            href={`/dashboard/mcq-player/${set.id}`}
            className="p-5 border rounded-lg shadow bg-white hover:bg-purple-50 transition"
          >
            <h2 className="font-semibold text-lg">{set.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{set.description}</p>
            <p className="mt-2 text-xs text-purple-700">
              Questions: {set.questionCount}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
