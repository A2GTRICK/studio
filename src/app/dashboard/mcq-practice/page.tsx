"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function McqPracticePage() {
  const [sets, setSets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // ✅ USE THE SAME API AS /a2gadmin/mcq
        const res = await fetch("/api/a2gadmin/mcq");
        const data = await res.json();

        console.log("Fetched MCQ sets:", data);

        // FIX: ensure data.sets exists (based on API response)
        const allSets = Array.isArray(data.sets) ? data.sets : [];

        // Show sets only marked as published
        const published = allSets.filter((s) => s.isPublished === true);

        setSets(published);
      } catch (e) {
        console.error("MCQ Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading MCQ Sets...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">MCQ Practice</h1>

      {sets.length === 0 && (
        <div className="text-gray-600">No published MCQ sets found.</div>
      )}

      <div className="grid gap-4">
        {sets.map((s) => (
          <Link
            href={`/dashboard/mcq-practice/${s.id}`}
            key={s.id}
            className="block border rounded-lg p-4 bg-white shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">{s.title}</h2>
            <p className="text-sm text-gray-600">{s.description}</p>
            {s.isPremium && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-200 rounded">
                Premium
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
