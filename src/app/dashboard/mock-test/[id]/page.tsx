"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchMockTestById } from "@/services/mock-test";
import { Loader2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateMockResult } from "@/utils/mockTestResult";

type AnswerMap = Record<number, string>;

export default function MockTestPlayerPage() {
  const params = useParams();
  const testId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [curIndex, setCurIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // =============================
  // LOAD MOCK TEST
  // =============================
  useEffect(() => {
    if (!testId) return;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchMockTestById(testId);
        setTest(data);
        setTimeLeft((data.duration || 0) * 60);
        startTimer();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      stopTimer();
    };
  }, [testId]);

  // =============================
  // TIMER
  // =============================
  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // =============================
  // ANSWERS
  // =============================
  function selectAnswer(value: string) {
    setAnswers((prev) => ({
      ...prev,
      [curIndex]: value,
    }));
  }

  // =============================
  // SUBMIT
  // =============================
  function handleSubmit() {
    const unattempted = test.questions.length - Object.keys(answers).length;
    if (unattempted > 0) {
      const confirmSubmit = confirm(
        `You have ${unattempted} unattempted questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    stopTimer();
    
    // Fire-and-forget the API call to save the attempt
    fetch("/api/mock-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          answers,
          timeTakenSeconds: (test.duration || 0) * 60 - timeLeft,
          warnings: 0,
        }),
    }).catch(err => {
        // Log error but don't block the user
        console.error("Failed to save test attempt to server:", err);
    });

    const result = calculateMockResult(
      test.questions,
      answers,
      1,     // marks per question
      0.25   // negative marks
    );

    // Store a single object for both results and review to prevent race conditions
    sessionStorage.setItem(
      "mockTestResult",
      JSON.stringify({
        result,
        questions: test.questions,
        answers,
      })
    );
    
    // Also set the review-specific key for the review page, pointing to the same data structure
    sessionStorage.setItem(
      "mockTestReview",
      JSON.stringify({
        questions: test.questions,
        answers,
      })
    );


    router.push("/dashboard/mock-test/result");
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin inline" />
      </div>
    );
  }

  if (!test || !test.questions || test.questions.length === 0) {
    return (
      <div className="p-10 text-center text-red-600">
        Mock test not found or is empty.
      </div>
    );
  }

  const question = test.questions[curIndex];
  
  if (!question) {
     return (
      <div className="p-10 text-center">
        Loading question...
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto lg:flex gap-6">

        {/* MAIN PANEL */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{test.title}</h2>
            <div className="flex items-center gap-2 text-red-600 font-mono">
              <Timer className="w-4 h-4" />
              {mins.toString().padStart(2, "0")}:
              {secs.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="border rounded p-6">
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                Q {curIndex + 1} / {test.questions.length}
              </div>
              <div className="mt-2 font-medium">
                {question.questionText}
              </div>
            </div>

            <div className="space-y-3">
              {question.options.map((opt: any, idx: number) => {
                const selected = answers[curIndex] === opt.text;
                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-3 border rounded cursor-pointer ${
                      selected
                        ? "border-purple-600 bg-purple-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selected}
                      onChange={() => selectAnswer(opt.text)}
                    />
                    <span>{opt.text}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button
                variant="outline"
                disabled={curIndex === 0}
                onClick={() => setCurIndex((i) => Math.max(0, i - 1))}
              >
                Prev
              </Button>

              <Button
                onClick={() =>
                  setCurIndex((i) =>
                    Math.min(test.questions.length - 1, i + 1)
                  )
                }
              >
                Next
              </Button>

              <Button
                className="ml-auto bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={submitting}
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>

        {/* QUESTION PALETTE */}
        <aside className="w-64 hidden lg:block">
          <div className="p-4 border rounded">
            <h4 className="font-bold">Question Palette</h4>

            <div className="grid grid-cols-5 gap-2 mt-3">
              {test.questions.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurIndex(idx)}
                  className={`p-2 rounded text-sm ${
                    answers[idx]
                      ? "bg-green-200"
                      : "bg-gray-100"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
