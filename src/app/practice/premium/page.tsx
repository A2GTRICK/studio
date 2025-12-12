// --- PREMIUM MCQ PRACTICE PAGE (OPTION A - FULL FILE) ---
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllMCQSets, type MCQSet } from "@/services/mcq";
import { Play, Star, X, Loader2, Timer, CheckCircle, XCircle, BookOpen } from "lucide-react";

//-----------------------------------------------------------
// 1. ROOT COMPONENT STRUCTURE
//-----------------------------------------------------------
export default function PremiumMCQPracticePage() {
  const [sets, setSets] = useState<MCQSet[]>([]);
  const [filtered, setFiltered] = useState<MCQSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [course, setCourse] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [withExplanation, setWithExplanation] = useState(false);
  const [onlyUnattempted, setOnlyUnattempted] = useState(false);
  const [sortBy, setSortBy] = useState("latest");

  // State for Modals/Players
  const [preview, setPreview] = useState<MCQSet | null>(null);
  const [activeExam, setActiveExam] = useState<MCQSet | null>(null);
  const [resultsData, setResultsData] = useState<{ set: MCQSet; answers: any; } | null>(null);


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

  //-----------------------------------------------------------
  // SUBJECTS / COURSES LIST
  //-----------------------------------------------------------
  const subjects = useMemo(
    () => ["all", ...Array.from(new Set(sets.map((s) => s.subject))).filter(Boolean)],
    [sets]
  );

  const courses = useMemo(
    () => ["all", ...Array.from(new Set(sets.map((s) => s.course))).filter(Boolean)],
    [sets]
  );

  //-----------------------------------------------------------
  // FILTER SYSTEM
  //-----------------------------------------------------------
  useEffect(() => {
    let f = [...sets];

    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter((s) => s.title.toLowerCase().includes(q));
    }
    if (subject !== "all") f = f.filter((s) => s.subject === subject);
    if (course !== "all") f = f.filter((s) => s.course === course);
    if (premiumOnly) f = f.filter((s) => s.isPremium);
    if (withExplanation) f = f.filter((s) => s.questions.some((q) => q.explanation));
    if (difficulty !== "all") f = f.filter((s) => s.questions.some((q) => q.difficulty === difficulty));
    if (onlyUnattempted) f = f.filter((s) => !localStorage.getItem(`mcq_attempt_${s.id}`));

    if (sortBy === "latest") f.sort((a, b) => ((b.updatedAt as any)?.seconds || 0) - ((a.updatedAt as any)?.seconds || 0));
    if (sortBy === "oldest") f.sort((a, b) => ((a.updatedAt as any)?.seconds || 0) - ((b.updatedAt as any)?.seconds || 0));
    if (sortBy === "most") f.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    if (sortBy === "least") f.sort((a, b) => (a.questions?.length || 0) - (b.questions?.length || 0));

    setFiltered(f);
  }, [sets, query, subject, course, premiumOnly, withExplanation, difficulty, onlyUnattempted, sortBy]);

  //-----------------------------------------------------------
  // RENDER
  //-----------------------------------------------------------
  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin w-8 h-8 mx-auto" /></div>;
  if (error) return <div className="text-red-600 p-6">{error}</div>;

  const handleStartExam = (set: MCQSet) => {
    setPreview(null);
    setActiveExam(set);
  };
  
  const handleFinishExam = (answers: any) => {
      if (activeExam) {
        setResultsData({ set: activeExam, answers });
      }
      setActiveExam(null);
  }
  
  const handleCloseResults = () => {
      setResultsData(null);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Premium MCQ Practice</h1>
      <p className="text-gray-600">Exam-style practice experience with analytics.</p>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow space-y-3 border">
        <div className="flex flex-wrap gap-3">

          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className="border px-2 py-2 rounded"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Subjects" : s}
              </option>
            ))}
          </select>

          <select
            className="border px-2 py-2 rounded"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            {courses.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Courses" : c}
              </option>
            ))}
          </select>

          <select
            className="border px-2 py-2 rounded"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="all">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            className="border px-2 py-2 rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="most">Most Questions</option>
            <option value="least">Least Questions</option>
          </select>
        </div>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={premiumOnly} onChange={(e)=>setPremiumOnly(e.target.checked)} />
            Premium only
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={withExplanation} onChange={(e)=>setWithExplanation(e.target.checked)} />
            Has explanation
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={onlyUnattempted} onChange={(e)=>setOnlyUnattempted(e.target.checked)} />
            Unattempted only
          </label>
        </div>
      </div>

      {/* SET CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            onClick={() => setPreview(s)}
            className="p-4 bg-white border rounded shadow hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">{s.title}</h3>
              {s.isPremium && <Star className="w-5 h-5 text-amber-500" />}
            </div>
            <p className="text-sm text-gray-600">{s.subject} • {s.course}</p>
            <p className="text-sm mt-2">Questions: {s.questions.length}</p>
          </div>
        ))}
      </div>
      
      <AnimatePresence>
        {preview && <PreviewDrawer set={preview} onClose={() => setPreview(null)} onStart={handleStartExam} />}
        {activeExam && <ExamPlayer setData={activeExam} onClose={() => setActiveExam(null)} onFinish={handleFinishExam} />}
        {resultsData && <ExamResults setData={resultsData.set} answers={resultsData.answers} onClose={handleCloseResults} />}
      </AnimatePresence>

    </div>
  );
}


// ==========================
// BLOCK 2 — PREVIEW DRAWER
// ==========================

// Right‑side preview drawer that slides in when a user clicks on an MCQ set.
// Shows title, metadata, first few questions, difficulty indicators, and CTA button.

function PreviewDrawer({ set, onClose, onStart }: { set: MCQSet, onClose: () => void, onStart: (set: MCQSet) => void }) {
  if (!set) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-xl h-full bg-white shadow-xl p-6 overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="text-sm underline absolute right-4 top-4 text-gray-600 hover:text-black"
        >
          Close
        </button>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug">{set.title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {set.subject} • {set.course}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {(set.questions || []).slice(0, 3).map((q: any, i: number) => (
            <div key={i} className="border rounded-lg p-3 bg-gray-50">
              <p className="font-semibold text-gray-800">
                {i + 1}. {q.question}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => onStart(set)}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <Play className="h-5 w-5" />
          Start Practice
        </button>
      </motion.div>
    </motion.div>
  );
}

// END BLOCK 2 — PREVIEW DRAWER


// ==============================================
// BLOCK 3 — FULL EXAM PLAYER (NTA‑STYLE ENGINE)
// ==============================================
// Includes:
// • Full-screen exam UI
// • Sidebar palette
// • Save & Next / Mark / Clear
// • Timer with auto-submit
// • Attempt tracking
// • LocalStorage sync
// ==============================================

function ExamPlayer({ setData, onClose, onFinish }: { setData: MCQSet, onClose: () => void, onFinish: (answers: any) => void }) {
  const questions = setData?.questions || [];
  const total = questions.length;

  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<any>({}); // { qid: "OptionText" }
  const [marked, setMarked] = React.useState<any>({}); // flagged questions
  const [remainingTime, setRemainingTime] = React.useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(`timer_${setData.id}`) : null;
    return stored ? Number(stored) : (setData.timeLimit || 20) * 60; // default 20 min
  });

  const q = questions[index];

  // ===========================
  // TIMER
  // ===========================
  React.useEffect(() => {
    const t = setInterval(() => {
      setRemainingTime((s: number) => {
        const v = s - 1;
        localStorage.setItem(`timer_${setData.id}`, String(v));
        if (v <= 0) {
          clearInterval(t);
          handleSubmit();
        }
        return v;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [setData.id]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss < 10 ? "0" : ""}${ss}`;
  };

  // ===========================
  // ACTIONS
  // ===========================
  const selectAnswer = (opt: string) => {
    setAnswers((a: any) => ({ ...a, [q.id]: opt }));
  };

  const handleSaveNext = () => {
    if (index < total - 1) setIndex(index + 1);
  };

  const handleMark = () => {
    setMarked((m: any) => ({ ...m, [q.id]: !m[q.id] }));
  };

  const handleSubmit = () => {
    localStorage.setItem(`mcq_attempt_${setData.id}`, JSON.stringify(answers));
    onFinish?.(answers);
  };

  const paletteColor = (qid: string) => {
    if (marked[qid]) return "bg-blue-200";
    if (answers[qid]) return "bg-purple-200";
    return "bg-gray-100";
  };

  // ===========================
  // UI
  // ===========================

  return (
    <div className="fixed inset-0 bg-white z-[60] flex overflow-hidden">

      {/* LEFT PALETTE */}
      <div className="w-48 border-r p-4 overflow-y-auto bg-gray-50">        
        <h3 className="font-bold mb-3">Questions</h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((qq: any, i: number) => (
            <button
              key={qq.id}
              onClick={() => setIndex(i)}
              className={`h-8 w-8 rounded text-sm flex items-center justify-center border ${paletteColor(qq.id)} ${i === index ? "ring-2 ring-purple-500" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{setData.title}</h2>
          <div className="flex items-center gap-6">
            <span className="text-red-600 font-bold text-lg">⏱ {formatTime(remainingTime)}</span>
            <button onClick={onClose} className="underline text-gray-600">Exit</button>
          </div>
        </div>

        {/* QUESTION */}
        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="font-semibold text-lg mb-4">{index + 1}. {q.question}</h3>

          <div className="space-y-3">
            {q.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => selectAnswer(opt)}
                className={`w-full text-left p-3 rounded border hover:bg-gray-100 ${answers[q.id] === opt ? "bg-purple-100 border-purple-400" : "bg-white"}`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
              <button onClick={handleMark} className="px-4 py-2 rounded border bg-gray-200">Mark</button>
              <button onClick={handleSaveNext} className="px-4 py-2 rounded bg-blue-600 text-white">Save & Next</button>
              <button onClick={handleSubmit} className="ml-auto px-4 py-2 rounded bg-green-600 text-white">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// END BLOCK 3 — EXAM PLAYER ENGINE



// ==============================================
// BLOCK 4 — RESULTS + REVIEW ENGINE
// ==============================================
// Provides:
// • Score calculation
// • Detailed review (correct/incorrect)
// • Explanation, topic, difficulty badges
// • Sidebar palette preserved for review
// • Analytics base layer (accuracy, attempted count)
// ==============================================

function ExamResults({ setData, answers, onClose }: { setData: MCQSet, answers: any, onClose: () => void }) {
  const questions = setData.questions;

  const result = React.useMemo(() => {
    let correct = 0;
    let attempted = 0;

    questions.forEach((q: any) => {
      const ans = answers[q.id];
      if (ans) attempted++;
      if (ans && ans.trim() === q.correctAnswer.trim()) correct++;
    });

    return {
      total: questions.length,
      attempted,
      correct,
      incorrect: attempted - correct,
      accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
    };
  }, [answers, questions]);

  const [index, setIndex] = React.useState(0);
  const q = questions[index];
  const userAns = answers[q.id];
  const isCorrect = userAns && userAns.trim() === q.correctAnswer.trim();

  const statusColor = (qid: string) => {
    const ans = answers[qid];
    if (!ans) return "bg-gray-200";
    const correct = questions.find((x: any) => x.id === qid)?.correctAnswer;
    return ans.trim() === correct.trim() ? "bg-green-300" : "bg-red-300";
  };

  return (
    <div className="fixed inset-0 bg-white z-[70] flex overflow-hidden">

      {/* LEFT REVIEW PALETTE */}
      <div className="w-48 border-r p-4 overflow-y-auto bg-gray-50">        
        <h3 className="font-bold mb-3">Review</h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((qq: any, i: number) => (
            <button
              key={qq.id}
              onClick={() => setIndex(i)}
              className={`h-8 w-8 rounded text-sm border flex items-center justify-center ${statusColor(qq.id)} ${i===index ? "ring-2 ring-purple-500" : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button onClick={onClose} className="mt-6 underline text-sm text-gray-600">Close</button>
      </div>

      {/* RIGHT SIDE CONTENT */}
      <div className="flex-1 overflow-y-auto">

        {/* SUMMARY HEADER */}
        <div className="border-b p-6 bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold">Results</h2>
          <div className="flex gap-6 mt-3 text-sm">
            <span>Total: <strong>{result.total}</strong></span>
            <span>Attempted: <strong>{result.attempted}</strong></span>
            <span>Correct: <strong className="text-green-700">{result.correct}</strong></span>
            <span>Incorrect: <strong className="text-red-700">{result.incorrect}</strong></span>
            <span>Accuracy: <strong>{result.accuracy}%</strong></span>
          </div>
        </div>

        {/* REVIEW AREA */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{index + 1}. {q.question}</h3>

          <div className="space-y-3">
            {q.options.map((opt: string, i: number) => {
              const isCorrectOpt = opt.trim() === q.correctAnswer.trim();
              const isUserOpt = opt.trim() === (userAns || "").trim();

              return (
                <div
                  key={i}
                  className={`p-3 rounded border ${
                    isCorrectOpt ? "bg-green-100 border-green-400" :
                    isUserOpt && !isCorrectOpt ? "bg-red-100 border-red-400" : "bg-white"
                  }`}
                >
                  {opt}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {q.explanation && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <h4 className="font-semibold mb-1">Explanation</h4>
              <p>{q.explanation}</p>
            </div>
          )}

          {/* Topic & Difficulty */}
          <div className="mt-4 flex gap-3 text-sm">
            {q.topic && <span className="bg-blue-100 px-3 py-1 rounded">Topic: {q.topic}</span>}
            {q.difficulty && <span className="bg-gray-200 px-3 py-1 rounded">{q.difficulty}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
