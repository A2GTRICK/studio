// Ultra-Premium MCQ Practice Page (Option C — Clean Full Replacement)
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { Loader2, Play, Star, BarChart2 } from "lucide-react";
import MCQPlayer from "@/components/mcq/MCQPlayer";
import { fetchAllMCQSets, type MCQSet } from "@/services/mcq";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import PremiumCardV3 from "@/components/practice-premium/PremiumCardV3";

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
  const [onlyUnattempted, setOnlyUnattempted] = useState(false);
  const [withExplanation, setWithExplanation] = useState(false);
  const [sortBy, setSortBy] = useState("latest");

  const [previewSet, setPreviewSet] = useState<MCQSet | null>(null);
  const [playerSet, setPlayerSet] = useState<MCQSet | null>(null);

  const [analytics, setAnalytics] = useState<Record<string, any>>({});
  const [visibleCount, setVisibleCount] = useState(12);
  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const snap = await getDocs(collection(db, "mcqAttempts"));
        const map: Record<string, any> = {};
        snap.forEach((d) => (map[d.id] = d.data()));

        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith("mcq_attempt_")) {
            const id = k.replace("mcq_attempt_", "");
            try {
              const local = JSON.parse(localStorage.getItem(k) || "{}");
              map[id] = { ...(map[id] || {}), ...local };
            } catch {}
          }
        });
        setAnalytics(map);
      } catch {}
    }
    loadAnalytics();
  }, []);

  const subjects = useMemo(() => ["all", ...Array.from(new Set(sets.map((s) => s.subject).filter(Boolean)))], [sets]);
  const courses = useMemo(() => ["all", ...Array.from(new Set(sets.map((s) => s.course).filter(Boolean)))], [sets]);

  useEffect(() => {
    let f = [...sets];

    if (query.trim()) f = f.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));
    if (subject !== "all") f = f.filter((s) => s.subject === subject);
    if (course !== "all") f = f.filter((s) => s.course === course);
    if (premiumOnly) f = f.filter((s) => s.isPremium);
    if (withExplanation) f = f.filter((s) => s.questions.some((q) => q.explanation));
    if (difficulty !== "all") f = f.filter((s) => s.questions.some((q: any) => q.difficulty === difficulty));
    if (onlyUnattempted) f = f.filter((s) => !localStorage.getItem(`mcq_attempt_${s.id}`));

    if (sortBy === "latest") f.sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));
    if (sortBy === "most") f.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));

    setFiltered(f);
  }, [sets, query, subject, course, premiumOnly, withExplanation, difficulty, onlyUnattempted, sortBy]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisibleCount((v) => v + 12);
    });
    if (scrollRef.current) observer.observe(scrollRef.current);
    return () => observer.disconnect();
  }, []);

  function openPreview(set: MCQSet) {
    setPreviewSet(set);
  }

  function openPlayer(set: MCQSet) {
    setPlayerSet(set);
  }

  if (loading)
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );

  if (error)
    return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">MCQ Practice (Premium)</h1>
        <p className="text-gray-600">Premium Cards • Analytics • Infinite Scroll • Smart Filters</p>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex flex-wrap gap-3">
          <input className="border rounded px-3 py-2 flex-1" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />

          <select className="border px-2 py-2 rounded" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select className="border px-2 py-2 rounded" value={course} onChange={(e) => setCourse(e.target.value)}>
            {courses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select className="border px-2 py-2 rounded" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="all">Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select className="border px-2 py-2 rounded" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="latest">Latest</option>
            <option value="most">Most Questions</option>
          </select>
        </div>

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={premiumOnly} onChange={(e) => setPremiumOnly(e.target.checked)} /> Premium
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={withExplanation} onChange={(e) => setWithExplanation(e.target.checked)} /> Explanation
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={onlyUnattempted} onChange={(e) => setOnlyUnattempted(e.target.checked)} /> Unattempted
          </label>
        </div>
      </div>

      {/* Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, visibleCount).map((s) => (
          <PremiumCardV3 key={s.id} set={s} analytics={analytics[s.id]} onClick={() => openPreview(s)} />
        ))}
      </div>

      <div ref={scrollRef} className="h-10"></div>

      {/* Preview Drawer */}
      <AnimatePresence>
        {previewSet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex justify-end"
            onClick={() => setPreviewSet(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl bg-white h-full shadow-2xl p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setPreviewSet(null)} className="text-sm underline mb-4">Close</button>
              <h2 className="text-2xl font-bold">{previewSet.title}</h2>
              <p className="text-gray-600 mb-4">{previewSet.subject} • {previewSet.course}</p>
              
              <div className="mt-4 space-y-3">
                <h3 className="font-semibold">Sample Questions:</h3>
                {previewSet.questions.slice(0, 3).map((q: any, i: number) => (
                  <div key={i} className="border rounded p-3 bg-gray-50">
                    <p className="font-medium">{i + 1}. {q.question}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold"
                  onClick={() => {
                    openPlayer(previewSet);
                    setPreviewSet(null);
                  }}
                >
                  <Play /> Start Practice
                </button>
                <button className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                  <BarChart2 /> View Analytics
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {playerSet && (
        <MCQPlayer
          setData={playerSet}
          onClose={() => setPlayerSet(null)}
        />
      )}
    </div>
  );
}
