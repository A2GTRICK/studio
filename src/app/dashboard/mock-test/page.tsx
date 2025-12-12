
// --- PREMIUM MCQ PRACTICE PAGE (OPTION A - FULL FILE BEGIN) ---

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAllMCQSets, type MCQSet } from "@/services/mcq";
import { Play, Star, X, Loader2, Timer, ChevronRight, ChevronLeft, CheckCircle, XCircle, Eye, BookOpen } from "lucide-react";
import { db } from "@/firebase/config";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";


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
  const [examSet, setExamSet] = useState<MCQSet | null>(null);
  const [resultsData, setResultsData] = useState<{ set: MCQSet; answers: any; result: any; } | null>(null);

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
    () => ["all", ...Array.from(new Set(sets.map((s: MCQSet) => s.subject))).filter(Boolean)],
    [sets]
  );

  const courses = useMemo(
    () => ["all", ...Array.from(new Set(sets.map((s: MCQSet) => s.course))).filter(Boolean)],
    [sets]
  );

  //-----------------------------------------------------------
  // FILTER SYSTEM
  //-----------------------------------------------------------
  useEffect(() => {
    let f: MCQSet[] = [...sets];

    if (query.trim()) {
      const q = query.toLowerCase();
      f = f.filter((s) => s.title.toLowerCase().includes(q));
    }
    if (subject !== "all") f = f.filter((s) => s.subject === subject);
    if (course !== "all") f = f.filter((s) => s.course === course);
    if (premiumOnly) f = f.filter((s) => s.isPremium);
    if (withExplanation) f = f.filter((s) => s.questions.some((q) => q.explanation));
    if (difficulty !== "all") f = f.filter((s) => s.questions.some((q: any) => q.difficulty === difficulty));
    if (onlyUnattempted) f = f.filter((s) => !localStorage.getItem(`mcq_attempt_${s.id}`));

    if (sortBy === "latest") f.sort((a, b) => ((b.updatedAt as any)?.seconds || 0) - ((a.updatedAt as any)?.seconds || 0));
    if (sortBy === "oldest") f.sort((a, b) => ((a.updatedAt as any)?.seconds || 0) - ((b.updatedAt as any)?.seconds || 0));
    if (sortBy === "most") f.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    if (sortBy === "least") f.sort((a, b) => (a.questions?.length || 0) - (b.questions?.length || 0));

    setFiltered(f);
  }, [sets, query, subject, course, premiumOnly, withExplanation, difficulty, onlyUnattempted, sortBy]);

  const handleFinishExam = (setData: MCQSet, answers: any, result: any) => {
    setResultsData({ set: setData, answers, result });
    setExamSet(null);
  };
  
  //-----------------------------------------------------------
  // RENDER
  //-----------------------------------------------------------
  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="text-red-600 p-6">{error}</div>;

  const isInitialLoadAndEmpty = sets.length === 0 && !loading;

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
      {isInitialLoadAndEmpty ? (
        <FallbackUI />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s: MCQSet) => (
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
      )}
      
      <AnimatePresence>
        {preview && (
          <PreviewDrawer
            set={preview}
            onClose={() => setPreview(null)}
            onStart={(set) => {
              setExamSet(set);
              setPreview(null);
            }}
          />
        )}
        {examSet && (
          <ExamPlayer
            setData={examSet}
            onClose={() => setExamSet(null)}
            onFinish={handleFinishExam}
          />
        )}
        {resultsData && (
          <ExamResults
            setData={resultsData.set}
            answers={resultsData.answers}
            result={resultsData.result}
            onClose={() => setResultsData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================
// FALLBACK UI COMPONENTS
// ==========================

const placeholderCategories = [
    "GPAT Mock Test",
    "RRB Pharmacist Exam",
    "NIPER Model Test",
    "D.Pharm Board Test",
    "Mini Test (25 Q)",
    "Speed Test (10 Q)",
];

const PlaceholderCard = () => (
    <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg shadow-sm animate-pulse">
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
    </div>
);


const FallbackUI = () => (
    <div>
        {placeholderCategories.map(category => (
            <div key={category} className="mb-8">
                <h2 className="text-xl font-bold mb-4">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-white border rounded shadow">
                        <h3 className="font-bold text-lg text-gray-400">Coming Soon</h3>
                        <p className="text-sm text-gray-500 mt-1">Mock test will be available soon.</p>
                        <div className="flex justify-between text-sm text-gray-400 mt-3">
                            <span>Questions: —</span>
                            <span>Time: —</span>
                        </div>
                    </div>
                   <PlaceholderCard />
                   <PlaceholderCard />
                </div>
            </div>
        ))}
    </div>
);


// ==========================
// BLOCK 2 — PREVIEW DRAWER
// ==========================

function PreviewDrawer({ set, onClose, onStart }: { set: MCQSet; onClose: () => void; onStart: (set: MCQSet) => void; }) {
  if (!set) return null;

  return (
    <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="w-full max-w-xl h-full bg-white shadow-xl p-6 overflow-y-auto relative" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
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

// ==============================================
// BLOCK 3 — FULL EXAM PLAYER (NTA‑STYLE ENGINE)
// ==============================================

function ExamPlayer({ setData, onClose, onFinish }: { setData: MCQSet; onClose: () => void; onFinish: (setData: MCQSet, answers: any, result: any) => void; }) {
  const questions = setData?.questions || [];
  const total = questions.length;

  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<any>({}); // { qid: "OptionText" }
  const [marked, setMarked] = React.useState<any>({}); // flagged questions
  const [remainingTime, setRemainingTime] = React.useState(() => 60 * 20); // default 20 min
  
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const q = questions[index];

  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingTime((s: number) => {
        const v = s - 1;
        if (v <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
        }
        return v;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss < 10 ? "0" : ""}${ss}`;
  };

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
    if (timerRef.current) clearInterval(timerRef.current);
    const result = {
      total: questions.length,
      attempted: Object.keys(answers).length,
      correct: questions.filter((q: any) => answers[q.id] && answers[q.id].trim() === q.correctAnswer.trim()).length,
    };
    saveAttemptToFirestore(setData, answers, result);
    onFinish?.(setData, answers, result);
  };

  const paletteColor = (qid: string) => {
    if (marked[qid]) return "bg-blue-200";
    if (answers[qid]) return "bg-purple-200";
    return "bg-gray-100";
  };

  return (
    <motion.div className="fixed inset-0 bg-white z-[60] flex overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold">{setData.title}</h2>
          <div className="flex items-center gap-6">
            <span className="text-red-600 font-bold text-lg"><Timer className="inline w-5 h-5" /> {formatTime(remainingTime)}</span>
            <button onClick={onClose} className="underline text-gray-600">Exit</button>
          </div>
        </div>
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
    </motion.div>
  );
}


// ==============================================
// BLOCK 4 — RESULTS + REVIEW ENGINE
// ==============================================

function ExamResults({ setData, answers, result, onClose }: { setData: MCQSet; answers: any; result: any; onClose: () => void; }) {
  const questions: any[] = setData.questions;
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
    <motion.div className="fixed inset-0 bg-white z-[70] flex overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
      <div className="flex-1 overflow-y-auto">
        <div className="border-b p-6 bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold">Results</h2>
          <div className="flex gap-6 mt-3 text-sm">
            <span>Total: <strong>{result.total}</strong></span>
            <span>Attempted: <strong>{result.attempted}</strong></span>
            <span>Correct: <strong className="text-green-700">{result.correct}</strong></span>
            <span>Incorrect: <strong className="text-red-700">{result.total - result.attempted + (result.attempted - result.correct)}</strong></span>
            <span>Accuracy: <strong>{result.attempted > 0 ? Math.round((result.correct / result.attempted) * 100) : 0}%</strong></span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">{index + 1}. {q.question}</h3>
          <div className="space-y-3">
            {q.options.map((opt: string, i: number) => {
              const isCorrectOpt = opt.trim() === q.correctAnswer.trim();
              const isUserOpt = opt.trim() === (userAns || "").trim();
              return (
                <div key={i} className={`p-3 rounded border ${ isCorrectOpt ? "bg-green-100 border-green-400" : isUserOpt && !isCorrectOpt ? "bg-red-100 border-red-400" : "bg-white" }`}>
                  {opt}
                </div>
              );
            })}
          </div>
          {q.explanation && (
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <h4 className="font-semibold mb-1">Explanation</h4>
              <p>{q.explanation}</p>
            </div>
          )}
          <div className="mt-4 flex gap-3 text-sm">
            {q.topic && <span className="bg-blue-100 px-3 py-1 rounded">Topic: {q.topic}</span>}
            {q.difficulty && <span className="bg-gray-200 px-3 py-1 rounded">{q.difficulty}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==============================================
// BLOCK 5 — FIRESTORE ATTEMPT HISTORY SAVER
// ==============================================
async function saveAttemptToFirestore(setData: any, answers: any, result: any) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return; // user not logged in → skip silently

    const attemptId = `${setData.id}_${Date.now()}`;
    const topicStats: any = {};
    setData.questions.forEach((q: any) => {
      const ua = answers[q.id];
      const correct = ua && ua.trim() === q.correctAnswer.trim();
      if (!topicStats[q.topic || "General"]) topicStats[q.topic || "General"] = { total: 0, wrong: 0 };
      topicStats[q.topic || "General"].total++;
      if (!correct) topicStats[q.topic || "General"].wrong++;
    });

    const payload = {
      userId: user.uid,
      mcqSetId: setData.id,
      title: setData.title,
      course: setData.course,
      subject: setData.subject,
      attemptedAt: serverTimestamp(),
      answers,
      score: result.correct,
      incorrect: result.incorrect,
      attempted: result.attempted,
      accuracy: result.accuracy,
      total: result.total,
      topicStats,
    };

    await setDoc(doc(db, "mcqAttempts", attemptId), payload);
  } catch (err) {
    console.error("Failed to save attempt:", err);
  }
}

// ==============================================
// BLOCK 6 — ANALYTICS ENGINE + DASHBOARD WIDGETS
// ==============================================
export function computeAnalytics(attempts: any[]) {
  if (!attempts || attempts.length === 0) return null;

  const totalAttempts = attempts.length;
  const avgAccuracy = Math.round(
    attempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / totalAttempts
  );

  const scoreTrend = attempts.map((a, i) => ({
    index: i + 1,
    accuracy: a.accuracy,
    score: a.score,
    timestamp: a.attemptedAt?.seconds || null,
  }));

  const topicHeatmap: any = {};
  attempts.forEach((attempt) => {
    const stats = attempt.topicStats || {};
    Object.keys(stats).forEach((topic) => {
      if (!topicHeatmap[topic]) topicHeatmap[topic] = { total: 0, wrong: 0 };
      topicHeatmap[topic].total += stats[topic].total;
      topicHeatmap[topic].wrong += stats[topic].wrong;
    });
  });

  const weakTopics = Object.entries(topicHeatmap)
    .map(([topic, data]: any) => ({
      topic,
      accuracy: data.total > 0 ? Math.round(((data.total - data.wrong) / data.total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  return {
    totalAttempts,
    avgAccuracy,
    weakTopics,
    topicHeatmap,
    scoreTrend,
  };
}

export async function fetchUserAttempts() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, "mcqAttempts"),
    where("userId", "==", user.uid)
  );

  const snap = await getDocs(q);
  const arr: any[] = [];
  snap.forEach((doc) => arr.push(doc.data()));
  return arr.sort((a, b) => (b.attemptedAt?.seconds || 0) - (a.attemptedAt?.seconds || 0));
}

export function AnalyticsSummary({ summary }: any) {
  if (!summary) return null;

  return (
    <div className="p-4 bg-white border rounded shadow-sm mb-4">
      <h2 className="text-xl font-bold mb-3">Performance Summary</h2>
      <div className="flex flex-wrap gap-6 text-sm">
        <div>Attempts: <strong>{summary.totalAttempts}</strong></div>
        <div>Average Accuracy: <strong>{summary.avgAccuracy}%</strong></div>
        <div>Weak Topics: <strong>{summary.weakTopics.map((t:any) => t.topic).join(', ') || 'None'}</strong></div>
      </div>
    </div>
  );
}

export function TopicHeatmapList({ heatmap }: any) {
  if (!heatmap) return null;

  return (
    <div className="p-4 bg-white border rounded shadow-sm space-y-2 mb-4">
      <h3 className="font-semibold">Topic Performance</h3>
      {Object.entries(heatmap).map(([topic, d]: any) => {
        const accuracy = d.total > 0 ? Math.round(((d.total - d.wrong) / d.total) * 100) : 0;
        return (
          <div key={topic} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
            <span>{topic}</span>
            <span className={accuracy < 50 ? "text-red-600" : accuracy < 75 ? "text-yellow-600" : "text-green-700"}>
              {accuracy}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ScoreTrendList({ trend }: any) {
  if (!trend) return null;

  return (
    <div className="p-4 bg-white border rounded shadow-sm space-y-2">
      <h3 className="font-semibold">Progress Over Time</h3>
      {trend.map((t: any, i: number) => (
        <div key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
          <span>Attempt {i + 1}</span>
          <span>{t.accuracy}% accuracy</span>
        </div>
      ))}
    </div>
  );
}
