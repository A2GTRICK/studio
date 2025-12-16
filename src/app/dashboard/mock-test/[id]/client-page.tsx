// src/app/dashboard/mock-test/[id]/client-page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Option = string | { text: string };

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: number;
}

interface MockTestClientPageProps {
    initialData: {
        title: string;
        questions: Question[];
    };
    testId: string;
}

export default function MockTestClientPage({ initialData, testId }: MockTestClientPageProps) {
  const router = useRouter();

  // Initialize state directly from server-provided props
  const [title] = useState(initialData.title);
  const [questions] = useState<Question[]>(initialData.questions);
  const [current, setCurrent] = useState(0);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [visited, setVisited] = useState<boolean[]>(() => new Array(initialData.questions.length).fill(false));
  const [marked, setMarked] = useState<boolean[]>(() => new Array(initialData.questions.length).fill(false));
  
  // Hardcoded duration, can be passed from server if needed
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!questions.length) return;

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
  }, [questions]);

  /* ---------------- VISIT TRACK ---------------- */
  useEffect(() => {
    if (!visited[current]) {
      const v = [...visited];
      v[current] = true;
      setVisited(v);
    }
  }, [current, visited]);

  /* ---------------- SUBMIT ---------------- */
  async function submitTest() {
    let correct = 0;
    let wrong = 0;

    questions.forEach((q, i) => {
      if (answers[i] == null) return;
      if (answers[i] === q.correctAnswer) correct++;
      else wrong++;
    });

    const score = correct - wrong * 0.25;

    try {
        await addDoc(collection(db, "testAttempts"), {
            testId: testId,
            correct,
            wrong,
            score,
            total: questions.length,
            createdAt: serverTimestamp(),
            answers: answers,
        });
    } catch(e) {
        console.error("Failed to save test attempt", e);
    }
    
    sessionStorage.setItem(
      "mockTestResult",
      JSON.stringify({
        totalQuestions: questions.length,
        attempted: Object.keys(answers).length,
        correct,
        wrong,
        skipped: questions.length - Object.keys(answers).length,
        score,
      })
    );

    router.push("/dashboard/mock-test/result");
  }


  if (!questions.length) {
    return (
        <div className="p-10 text-center text-muted-foreground">
            This test has no questions yet or the questions failed to load.
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
      return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
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
                const label = typeof opt === "string" ? opt : opt.text;
                return (
                  <label
                    key={i}
                    className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50"
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
