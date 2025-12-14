
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Timer, Loader2 } from "lucide-react";
import { fetchMockTests, MockTest } from "@/services/mock-test";

// ======================================================
// USER MOCK TEST LIST PAGE (ISOLATED & SAFE)
// ======================================================
export default function MockTestDashboardPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMockTests();
        setTests(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Mock Tests</h1>
      <p className="text-gray-600">
        Full-length exam simulations (NTA style)
      </p>

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
          <MockTestPlayer
            test={activeTest}
            onClose={() => setActiveTest(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ======================================================
// MOCK TEST CARD
// ======================================================
function MockTestCard({
  test,
  onStart,
}: {
  test: MockTest;
  onStart: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between"
    >
      <div>
        <h3 className="font-bold text-lg">{test.title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {test.subject} • {test.course}
        </p>
      </div>

      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>{test.questions?.length || 0} Questions</span>
        <span>
          <Timer className="inline w-4 h-4 mr-1" />
          {test.duration || 120} min
        </span>
      </div>

      <button
        onClick={onStart}
        className="mt-5 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4" />
        Start Mock Test
      </button>
    </motion.div>
  );
}

// ======================================================
// MOCK TEST PLAYER (SIMPLE & STABLE)
// ======================================================
function MockTestPlayer({
  test,
  onClose,
}: {
  test: MockTest;
  onClose: () => void;
}) {
  const questions = test.questions || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const q = questions[index];

  const select = (opt: string) => {
    setAnswers((a: any) => ({ ...a, [index]: opt }));
  };

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-48 border-r p-4 bg-gray-50">
        <h3 className="font-bold mb-3">Questions</h3>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-8 w-8 rounded border text-sm ${
                i === index ? "bg-purple-200" : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-sm underline text-gray-600"
        >
          Exit
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="font-bold text-xl mb-4">
          {index + 1}. {q.question}
        </h2>

        <div className="space-y-3">
          {q.options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => select(opt)}
              className={`w-full text-left p-3 border rounded ${
                answers[index] === opt
                  ? "bg-purple-100 border-purple-400"
                  : "bg-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="px-4 py-2 border rounded"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setIndex((i) => Math.min(questions.length - 1, i + 1))
            }
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
}
