"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Option = string | { text: string };

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: number;
  explanation?: string;
}

export default function CBTMockTestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  
  const [instructionAccepted, setInstructionAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const accepted = sessionStorage.getItem(`mocktest_${id}_accepted`);
    if (!accepted) {
      router.replace(`/dashboard/mock-test/${id}/instructions`);
      setInstructionAccepted(false);
    } else {
      setInstructionAccepted(true);
    }
  }, [id, router]);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [visited, setVisited] = useState<boolean[]>([]);
  const [marked, setMarked] = useState<boolean[]>([]);

  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes

  /* ---------------- LOAD TEST ---------------- */
  useEffect(() => {
    if (instructionAccepted !== true) return;
    loadTest();
  }, [instructionAccepted]);

  async function loadTest() {
    try {
      const testSnap = await getDoc(doc(db, "test_series", id));
      if (!testSnap.exists()) throw new Error("Test not found");

      const testData = testSnap.data();
      setTitle(testData.title ?? "Mock Test");
      setTimeLeft((testData.duration || 60) * 60);

      const qSnap = await getDocs(
        collection(db, "test_series", id, "questions")
      );

      const resolved: Question[] = qSnap.docs.map((d) => {
        const q = d.data();
        return {
          id: d.id,
          text:
            q.question?.text ??
            q.text ??
            q.question ??
            "Question text missing",
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: Number(q.correctAnswer ?? q.answer ?? 0),
          explanation: q.explanation ?? ""
        };
      });

      setQuestions(resolved);
      setVisited(new Array(resolved.length).fill(false));
      setMarked(new Array(resolved.length).fill(false));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!questions.length || instructionAccepted !== true) return;

    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          submitTest();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [questions, instructionAccepted]);

  /* ---------------- VISIT TRACK ---------------- */
  useEffect(() => {
    if (!visited[current]) {
      const v = [...visited];
      v[current] = true;
      setVisited(v);
    }
  }, [current]);

  /* ---------------- SUBMIT ---------------- */
  function submitTest() {
    let correct = 0;
    let wrong = 0;

    questions.forEach((q, i) => {
      if (answers[i] == null) return;
      if (answers[i] === q.correctAnswer) correct++;
      else wrong++;
    });

    const score = correct - wrong * 0.25;

    sessionStorage.setItem(
      "mockTestResult",
      JSON.stringify({
        totalQuestions: questions.length,
        attempted: Object.keys(answers).length,
        correct,
        wrong,
        skipped: questions.length - Object.keys(answers).length,
        score,
        answers,
        questions: questions.map(q => ({
          id: q.id,
          question: { text: q.text },
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? "",
        })),
      })
    );

    router.push("/dashboard/mock-test/result");
  }

  if (instructionAccepted === false) {
    return null; // hard stop — no render
  }

  if (instructionAccepted === null) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        This test has no questions yet or failed to load.
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/mock-test")}>
            Back to Mock Tests
          </Button>
        </div>
      </div>
    );
  }


  const q = questions[current];
  if (!q) {
     return (
      <div className="p-10 text-center text-muted-foreground">
        Loading question...
      </div>
    );
  }

  /* ---------------- PALETTE COLOR ---------------- */
  function paletteColor(i: number) {
    if (marked[i]) return "bg-blue-500 text-white";
    if (answers[i] != null) return "bg-green-500 text-white";
    if (visited[i]) return "bg-yellow-400";
    return "bg-gray-200";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">{title}</h1>
        <div className="flex items-center gap-6">
          <span className="font-semibold">
            Time Left: {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
          <Button variant="destructive" onClick={() => {
              if(confirm("Are you sure you want to submit the test?")) {
                  submitTest();
              }
          }}>
            Submit Test
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* QUESTION */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white border rounded p-5">
            <p className="font-semibold mb-3">
              Q{current + 1}. {q.text}
            </p>

            <div className="space-y-2">
              {q.options.map((opt, i) => {
                const label =
                  typeof opt === "string" ? opt : opt.text;
                return (
                  <label
                    key={i}
                    className="flex items-center gap-2 border rounded p-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`q-${current}`}
                      checked={answers[current] === i}
                      onChange={() =>
                        setAnswers({
                          ...answers,
                          [current]: i,
                        })
                      }
                    />
                    {label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const m = [...marked];
                  m[current] = !m[current];
                  setMarked(m);
                }}
              >
                Mark for Review
              </Button>

              <Button
                onClick={() =>
                  setCurrent(
                    current === questions.length - 1
                      ? current
                      : current + 1
                  )
                }
              >
                Save & Next
              </Button>
            </div>
          </div>
        </div>

        {/* PALETTE */}
        <div className="bg-white border rounded p-4 h-fit sticky top-24">
          <h2 className="font-semibold mb-3">Question Palette</h2>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`p-2 rounded text-sm ${paletteColor(i)}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
