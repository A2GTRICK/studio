// Ultra-Premium MCQ Practice Page (Option C) - Full Implementation

"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Star,
  Play,
  Timer,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";
import { fetchAllMCQSets, type MCQSet } from "@/services/mcq";

// ------------------------------------------------------------
// Question Type (Option A+)
// ------------------------------------------------------------
type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topic?: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

// ------------------------------------------------------------
// MAIN PAGE COMPONENT
// ------------------------------------------------------------
export default function PremiumPracticePage() {
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
  const [examSet, setExamSet] = useState<MCQSet | null>(null);

  // ------------------------------------------------------------
  // Load All Sets
  // ------------------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchAllMCQSets();
        setSets(data);
      } catch (err: any) {
        setError(String(err.message || err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const subjects = useMemo(() => ["all", ...Array.from(new Set(sets.map(s => s.subject).filter(Boolean)))], [sets]);
  const courses = useMemo(() => ["all", ...Array.from(new Set(sets.map(s => s.course).filter(Boolean)))], [sets]);

  // ------------------------------------------------------------
  // Filtering Logic
  // ------------------------------------------------------------
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
    if (onlyUnattempted) f = f.filter(s => !localStorage.getItem(`mcq_attempt_${s.id}`));

    if (sortBy === "latest") f.sort((a, b) => ((b.updatedAt as any)?.seconds || 0) - ((a.updatedAt as any)?.seconds || 0));
    if (sortBy === "oldest") f.sort((a, b) => ((a.updatedAt as any)?.seconds || 0) - ((b.updatedAt as any)?.seconds || 0));
    if (sortBy === "most") f = f.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    if (sortBy === "least") f = f.sort((a, b) => (a.questions?.length || 0) - (b.questions?.length || 0));

    setFiltered(f);
  }, [sets, query, subject, course, premiumOnly, withExplanation, difficulty, onlyUnattempted, sortBy]);

  // ------------------------------------------------------------
  // PAGE LOADING STATE
  // ------------------------------------------------------------
  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  // ------------------------------------------------------------
  // MAIN UI
  // ------------------------------------------------------------
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Premium MCQ Practice</h1>
        <p className="text-gray-600">Exam-style practice experience with analytics.</p>
      </header>

      {/* ---------------- Filters UI ---------------- */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <div className="flex flex-wrap gap-3">
          <input className="border rounded px-3 py-2 flex-1" placeholder="Search..." value={query} onChange={(e)=>setQuery(e.target.value)} />

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
          <label className="flex items-center gap-2"><input type="checkbox" checked={premiumOnly} onChange={(e)=>setPremiumOnly(e.target.checked)} />Premium only</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={withExplanation} onChange={(e)=>setWithExplanation(e.target.checked)} />Has explanation</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={onlyUnattempted} onChange={(e)=>setOnlyUnattempted(e.target.checked)} />Unattempted only</label>
        </div>
      </div>

      {/* ---------------- Listing Grid ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white border rounded shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => setPreviewSet(s)}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{s.title}</h3>
              {s.isPremium && <Star className="w-5 h-5 text-amber-500" />}
            </div>
            <p className="text-sm text-gray-600">{s.subject} • {s.course}</p>
            <p className="text-sm mt-2">Questions: {s.questions.length}</p>
          </motion.div>
        ))}
      </div>

      {/* ---------------- Preview Drawer ---------------- */}
      <AnimatePresence>
        {previewSet && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-xl h-full bg-white p-6 overflow-y-auto shadow-xl"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <button className="text-sm underline" onClick={()=>setPreviewSet(null)}>Close</button>
              <h2 className="text-2xl font-bold mt-2">{previewSet.title}</h2>
              <p className="text-gray-600">{previewSet.subject} • {previewSet.course}</p>

              <div className="mt-4 space-y-2">
                {previewSet.questions.slice(0, 3).map((q: any, i) => (
                  <div key={i} className="border p-2 rounded">
                    <p className="font-semibold">{i+1}. {q.question}</p>
                  </div>
                ))}
              </div>

              <button
                className="mt-5 bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => {
                  setExamSet(previewSet);
                  setPreviewSet(null);
                }}
              >
                <Play className="w-4 h-4" /> Start Practice
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------ */}
      {/* FULL-SCREEN EXAM PLAYER */}
      {/* ------------------------------------------------------------ */}
      <AnimatePresence>{examSet && <ExamPlayer key={examSet.id} setData={examSet} onClose={() => setExamSet(null)} />}</AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------
// EXAM PLAYER COMPONENT
// ------------------------------------------------------------
function ExamPlayer({ setData, onClose }: { setData: MCQSet; onClose: () => void }) {
  const questions: Question[] = setData.questions;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [id: string]: string }>({});
  const [marked, setMarked] = useState<{ [id: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions.length * 40); // 40 sec/question default

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ---------------- Timer ----------------
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if(timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const current = questions[index];

  function selectOption(opt: string) {
    setAnswers({ ...answers, [current.id]: opt });
  }

  function handleSubmit() {
    setSubmitted(true);
    try {
      localStorage.setItem(`mcq_attempt_${setData.id}`, JSON.stringify({ answers, marked }));
    } catch {}
  }

  const score = submitted
    ? questions.filter((q) => answers[q.id]?.trim() === q.correctAnswer.trim()).length
    : 0;

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* ---------------- Top Bar ---------------- */}
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h2 className="font-bold text-xl">{setData.title}</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-red-600">
            <Timer className="w-5 h-5" /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
          <button onClick={onClose} className="underline text-sm text-gray-700">Exit</button>
        </div>
      </div>

      {/* ---------------- Main Exam Layout ---------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---------- Left Palette ---------- */}
        <div className="w-60 border-r overflow-y-auto p-4 bg-gray-50 space-y-4">
          <h3 className="font-semibold mb-2">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const answered = answers[q.id];
              const isMarked = marked[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setIndex(i)}
                  className={`h-10 rounded flex items-center justify-center text-sm border
                  ${i === index ? "bg-blue-600 text-white" : "bg-white"}
                  ${answered ? "border-green-600" : ""}
                  ${isMarked ? "border-yellow-500" : ""}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Center Question Panel ---------- */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!submitted ? (
            <div className="space-y-6">
              <h2 className="font-semibold text-lg">{index + 1}. {current.question}</h2>

              <div className="space-y-3">
                {current.options.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => selectOption(opt)}
                    className={`p-3 border rounded cursor-pointer transition
                    ${answers[current.id] === opt ? "bg-blue-100 border-blue-600" : "bg-white"}`}
                  >
                    {opt}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setMarked({ ...marked, [current.id]: !marked[current.id] })}
                >
                  {marked[current.id] ? "Unmark" : "Mark"}
                </button>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}
                >
                  Save & Next
                </button>

                <button
                  className="px-4 py-2 bg-green-600 text-white rounded ml-auto"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="font-bold text-xl">Results</h2>
              <p className="text-lg">Score: {score} / {questions.length}</p>

              <h3 className="font-semibold text-lg mt-4">Review Questions</h3>
              <div className="space-y-4">
                {questions.map((q, i) => {
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.correctAnswer;
                  return (
                    <div key={q.id} className="border p-4 rounded bg-white">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{i + 1}. {q.question}</p>
                        {isCorrect ? <CheckCircle className="text-green-600" /> : <XCircle className="text-red-600" />}
                      </div>

                      <div className="mt-2">
                        <p className="text-sm">Your answer: {userAns || "—"}</p>
                        <p className="text-sm">Correct: {q.correctAnswer}</p>
                      </div>

                      {q.explanation && (
                        <p className="mt-2 text-gray-700 text-sm bg-gray-100 p-2 rounded">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <button onClick={onClose} className="mt-6 underline text-sm">Exit</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
