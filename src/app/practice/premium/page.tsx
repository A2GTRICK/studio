// Ultra-Premium MCQ Practice Page (Option C) - Full Implementation

"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { Loader2, Star, Play, Eye, TrendingUp, Timer, BookOpen } from "lucide-react";
import MCQPlayer from "@/components/mcq/MCQPlayer";
import { fetchAllMCQSets, type MCQSet } from "@/services/mcq";

export default function MCQPracticePagePremium() {
  const [sets, setSets] = useState<MCQSet[]>([]);
  const [filtered, setFiltered] = useState<MCQSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [course, setCourse] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [withExplanation, setWithExplanation] = useState(false);
  const [onlyUnattempted, setOnlyUnattempted] = useState(false);
  const [sortBy, setSortBy] = useState("latest");

  const [previewSet, setPreviewSet] = useState<MCQSet | null>(null);
  const [playerSet, setPlayerSet] = useState<MCQSet | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllMCQSets();
        setSets(data);
      } catch (e: any) {
        setError(String(e.message || e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const subjects = useMemo(() => ["all", ...Array.from(new Set(sets.map(s => s.subject).filter(Boolean)))], [sets]);
  const courses = useMemo(() => ["all", ...Array.from(new Set(sets.map(s => s.course).filter(Boolean)))], [sets]);

  useEffect(() => {
    let f = [...sets];

    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter(s => s.title.toLowerCase().includes(q));
    }
    if (subject !== "all") f = f.filter(s => s.subject === subject);
    if (course !== "all") f = f.filter(s => s.course === course);
    if (premiumOnly) f = f.filter(s => s.isPremium);
    if (withExplanation) f = f.filter(s => s.questions.some((q: any) => q.explanation));
    if (difficulty !== "all") f = f.filter(s => s.questions.some((q: any) => q.difficulty === difficulty));
    if (onlyUnattempted) f = f.filter(s => {
        try {
            return typeof window !== 'undefined' ? !localStorage.getItem(`mcq_attempt_${s.id}`) : true;
        } catch {
            return true;
        }
    });

    if (sortBy === "latest") {
        f.sort((a: any, b: any) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
    } else if (sortBy === 'oldest') {
        f.sort((a: any, b: any) => (a.updatedAt?.seconds || 0) - (b.updatedAt?.seconds || 0));
    } else if (sortBy === 'most') {
        f.sort((a,b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    } else if (sortBy === 'least') {
        f.sort((a,b) => (a.questions?.length || 0) - (b.questions?.length || 0));
    }


    setFiltered(f);
  }, [sets, query, subject, course, premiumOnly, withExplanation, difficulty, onlyUnattempted, sortBy]);

  function openPreview(set: MCQSet) { setPreviewSet(set); }
  function openPlayer(set: MCQSet) { setPlayerSet(set); }

  if (loading) return <div className="p-6 text-center"><Loader2 className="w-8 h-8 animate-spin"/></div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">MCQ Practice</h1>
        <p className="text-gray-600">Ultra-premium practice experience.</p>
      </header>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex flex-wrap gap-3">
          <input className="border rounded px-3 py-2 flex-1" placeholder="Search..." value={query} onChange={(e)=>setQuery(e.target.value)}/>

          <select className="border px-2 py-2 rounded" value={subject} onChange={(e)=>setSubject(e.target.value)}>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select className="border px-2 py-2 rounded" value={course} onChange={(e)=>setCourse(e.target.value)}>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select className="border px-2 py-2 rounded" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
            <option value="all">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select className="border px-2 py-2 rounded" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="most">Most Questions</option>
            <option value="least">Least Questions</option>
          </select>
        </div>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={premiumOnly} onChange={(e)=>setPremiumOnly(e.target.checked)}/>Premium only</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={withExplanation} onChange={(e)=>setWithExplanation(e.target.checked)}/>Has explanation</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={onlyUnattempted} onChange={(e)=>setOnlyUnattempted(e.target.checked)}/>Unattempted only</label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="p-4 bg-white border rounded shadow hover:shadow-lg transition cursor-pointer" onClick={()=>openPreview(s)}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{s.title}</h3>
              {s.isPremium && <Star className="w-5 h-5 text-amber-500"/>}
            </div>
            <p className="text-sm text-gray-600">{s.subject} • {s.course}</p>
            <p className="text-sm mt-2">Questions: {s.questions.length}</p>
          </div>
        ))}
      </div>

      {previewSet && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
          <div className="w-full max-w-xl bg-white h-full p-6 overflow-y-auto">
            <button onClick={()=>setPreviewSet(null)} className="text-sm underline">Close</button>
            <h2 className="text-xl font-bold mt-2">{previewSet.title}</h2>
            <p className="text-gray-600">{previewSet.subject} • {previewSet.course}</p>

            <div className="mt-4 space-y-2">
              {previewSet.questions.slice(0,3).map((q: any,i: number)=>(
                <div key={i} className="border rounded p-2">
                  <p className="font-semibold">{i+1}. {q.question}</p>
                </div>
              ))}
            </div>

            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2" onClick={()=>{ setPlayerSet(previewSet); setPreviewSet(null); }}>
              <Play className="w-4 h-4"/> Start Practice
            </button>
          </div>
        </div>
      )}

      {playerSet && (
        <MCQPlayer
          setData={playerSet}
          onClose={()=>setPlayerSet(null)}
        />
      )}
    </div>
  );
}
