"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { McqSet } from "@/context/mcq-context";

export default function McqPracticePage() {
  const [sets, setSets] = useState<McqSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // USE THE SAME WORKING API as the admin panel
        const res = await fetch("/api/a2gadmin/mcq");
        const data = await res.json();

        if (res.ok && Array.isArray(data.sets)) {
          // Filter for published sets on the client
          const publishedSets = data.sets.filter((s: McqSet) => s.isPublished === true);
          setSets(publishedSets);
        } else {
          console.error("Failed to fetch MCQ sets:", data.error);
        }

      } catch (e) {
        console.error("MCQ Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Practice Sets...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">MCQ Practice Zone</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Test your knowledge with practice sets designed for your exams.
        </p>
      </div>

      {sets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed">
          <h2 className="text-2xl font-semibold text-gray-700">No Practice Sets Available</h2>
          <p className="mt-2 text-muted-foreground">New MCQ sets will appear here once they are published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sets.map((set) => (
            <Link
              href={`/dashboard/mcq-practice/${set.id}`}
              key={set.id}
              className="group block"
            >
              <div className="bg-white rounded-xl border p-6 h-full flex flex-col shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{set.title}</h2>
                    {set.isPremium && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">Premium</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{set.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                  <span>{set.course} • {set.year}</span>
                  <span className="font-semibold">{set.questionCount || 0} Questions</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
