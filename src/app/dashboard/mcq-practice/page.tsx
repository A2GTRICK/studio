
"use client";

import React, { useEffect, useMemo, useState } from "react";
import MCQCard from "@/components/mcq/MCQCard";
import MCQPlayer from "@/components/mcq/MCQPlayer";
import { fetchAllMCQSets, type MCQSet } from "@/services/mcq";

export default function MCQPracticePage() {
  const [sets, setSets] = useState<MCQSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI controls
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [course, setCourse] = useState("all");
  const [onlyUnattempted, setOnlyUnattempted] = useState(false);

  // player
  const [activeSet, setActiveSet] = useState<MCQSet | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllMCQSets();
        setSets(data);
      } catch (e: any) {
        console.error(e);
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const subjects = useMemo(() => {
    const s = Array.from(new Set(sets.map((p) => p.subject).filter(Boolean)));
    return ["all", ...s];
  }, [sets]);

  const courses = useMemo(() => {
    const c = Array.from(new Set(sets.map((p) => p.course).filter(Boolean)));
    return ["all", ...c];
  }, [sets]);

  // derive filtered
  const filtered = useMemo(() => {
    let f = sets.slice();
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      f = f.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(q) ||
          (s.subject || "").toLowerCase().includes(q) ||
          (s.course || "").toLowerCase().includes(q)
      );
    }
    if (subject !== "all") f = f.filter((s) => s.subject === subject);
    if (course !== "all") f = f.filter((s) => s.course === course);

    if (onlyUnattempted) {
      // basic check: localStorage contains attempts by setId
      f = f.filter((s) => {
        try {
          const key = `mcq_attempt_${s.id}`;
          if (typeof window !== 'undefined') {
            const raw = localStorage.getItem(key);
            return !raw;
          }
          return true;
        } catch {
          return true;
        }
      });
    }

    return f;
  }, [sets, query, subject, course, onlyUnattempted]);

  function openPlayer(set: MCQSet) {
    setActiveSet(set);
    setPlayerOpen(true);
  }

  if (loading) return <div className="p-6">Loading MCQ sets...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold">MCQ Practice</h1>
        <p className="text-sm text-gray-600 mt-1">Practice MCQs — timed tests, progress, and review.</p>
      </header>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-3 flex-wrap">
          <input
            className="border rounded px-3 py-2 flex-1 min-w-[220px]"
            placeholder="Search sets, subjects, courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select className="border rounded px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => <option key={s} value={s}>{s === "all" ? "All Subjects" : s}</option>)}
          </select>

          <select className="border rounded px-3 py-2" value={course} onChange={(e) => setCourse(e.target.value)}>
            {courses.map((c) => <option key={c} value={c}>{c === "all" ? "All Courses" : c}</option>)}
          </select>

          <label className="inline-flex items-center gap-2 ml-auto">
            <input type="checkbox" checked={onlyUnattempted} onChange={(e) => setOnlyUnattempted(e.target.checked)} />
            <span className="text-sm">Only unattempted</span>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-600 bg-white rounded shadow">No MCQ sets found.</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <MCQCard
              key={s.id}
              set={s}
              onStart={() => openPlayer(s)}
            />
          ))}
        </div>
      )}

      {playerOpen && activeSet && (
        <MCQPlayer
          setData={activeSet}
          onClose={() => {
            setPlayerOpen(false);
            setActiveSet(null);
            // reload sets (optional) — we keep local data; user progress is stored in localStorage
          }}
        />
      )}
    </div>
  );
}
