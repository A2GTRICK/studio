
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Timer, Loader2, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { fetchPublishedTestSeries, type TestSeries } from "@/services/test-series";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// ======================================================
// MAIN PAGE COMPONENT
// ======================================================
export default function MockTestDashboardPage() {
  const [tests, setTests] = useState<TestSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<TestSeries | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPublishedTestSeries();
        setTests(data);
      } catch (err) {
        console.error("Failed to load mock tests:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFinish = (resultData: any) => {
    setResults(resultData);
    setActiveTest(null);
  };

  const handleCloseResults = () => {
    setResults(null);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (results) {
    return <MockTestResults results={results} onClose={handleCloseResults} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Mock Tests</h1>
      <p className="text-gray-600">Full-length exam simulations (NTA style)</p>

      {tests.length === 0 ? (
        <div className="bg-white border rounded p-6 text-gray-500">
          No mock tests available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((t) => (
            <MockTestCard key={t.id} test={t} onStart={() => setActiveTest(t)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {activeTest && (
          <MockTestPlayer test={activeTest} onClose={() => setActiveTest(null)} onFinish={handleFinish} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ======================================================
// MOCK TEST CARD
// ======================================================
function MockTestCard({ test, onStart }: { test: TestSeries; onStart: () => void; }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between"
    >
      <div>
        <h3 className="font-bold text-lg">{test.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{test.subject} • {test.course}</p>
      </div>

      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {test.questions?.length || 0} Questions</span>
        <span className="flex items-center gap-2"><Timer className="w-4 h-4" /> {test.duration || "N/A"} min</span>
      </div>

      <Button onClick={onStart} className="mt-5 w-full">
        <Play className="w-4 h-4 mr-2" />
        Start Mock Test
      </Button>
    </motion.div>
  );
}

// ======================================================
// MOCK TEST PLAYER
// ======================================================
function MockTestPlayer({ test, onClose, onFinish }: { test: TestSeries; onClose: () => void; onFinish: (result: any) => void; }) {
  const questions = test.questions || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const q = questions[index];

  const select = (opt: string) => {
    setAnswers((a) => ({ ...a, [index]: opt }));
  };
  
  const handleSubmit = () => {
    let score = 0;
    questions.forEach((question, i) => {
        if (answers[i] === question.correctAnswer) {
            score++;
        }
    });
    onFinish({ test, answers, score });
  };

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-bold">{test.title}</h2>
        <Button variant="ghost" onClick={onClose}>Exit</Button>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-4 text-sm text-gray-600">
          Question {index + 1} of {questions.length}
        </div>
        <h3 className="font-bold text-xl mb-4">{q.questionText}</h3>

        <div className="space-y-3">
          {q.options.map((opt: { text: string }, i: number) => (
            <button
              key={i}
              onClick={() => select(opt.text)}
              className={`w-full text-left p-3 border rounded-lg ${
                answers[index] === opt.text ? "bg-purple-100 border-purple-400" : "bg-white hover:bg-gray-50"
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>

      <footer className="p-4 border-t bg-gray-50 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Previous
        </Button>
        {index === questions.length - 1 ? (
             <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">Submit</Button>
        ) : (
            <Button onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}>
                Next
            </Button>
        )}
      </footer>
    </motion.div>
  );
}

// ======================================================
// MOCK TEST RESULTS
// ======================================================
function MockTestResults({ results, onClose }: { results: any; onClose: () => void; }) {
  const { test, answers, score } = results;
  const questions = test.questions || [];
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  return (
     <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
            <h1 className="text-3xl font-bold">Test Results</h1>
            <p className="text-gray-600 mt-1">{test.title}</p>
        </div>

        <div className="my-8 p-6 bg-white rounded-xl shadow-lg border text-center">
            <h2 className="text-5xl font-extrabold text-primary">{percentage}%</h2>
            <p className="text-lg mt-2">You scored {score} out of {total}</p>
            <Progress value={percentage} className="w-full h-3 mt-4" />
        </div>
        
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Review Answers</h3>
            {questions.map((q: any, i: number) => {
                 const isCorrect = answers[i] === q.correctAnswer;
                 return (
                    <div key={i} className={`p-4 rounded-lg border ${isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
                        <p className="font-semibold">{i + 1}. {q.questionText}</p>
                        <p className={`text-sm mt-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>Your answer: {answers[i] || "Not Answered"}</p>
                        {!isCorrect && <p className="text-sm mt-1 text-green-800 font-semibold">Correct answer: {q.correctAnswer}</p>}
                        {q.explanation && <p className="text-xs text-gray-600 mt-2 pt-2 border-t">Explanation: {q.explanation}</p>}
                    </div>
                );
            })}
        </div>

        <div className="mt-8 text-center">
            <Button onClick={onClose}>Back to Mock Tests</Button>
        </div>
     </div>
  );
}
