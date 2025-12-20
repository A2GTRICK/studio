"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
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
  const search = useSearchParams();
  const router = useRouter();

  /* 🔒 INSTRUCTION GATE */
  useEffect(() => {
    if (!search.get("start")) {
      router.replace(`/dashboard/mock-test/${id}/instructions`);
    }
  }, [id, router, search]);

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<boolean[]>([]);
  const [visited, setVisited] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600);

  // Hard Locks & Submission State
  const [warnings, setWarnings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitRequested, setSubmitRequested] = useState(false);

  // Single Safe Submit Function
  function submitTestSafe(reason: string) {
    if (isSubmitting) return;

    console.warn("CBT SUBMIT:", reason);
    setIsSubmitting(true);

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
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? "",
        })),
      })
    );

    // defer navigation safely
    setTimeout(() => {
      router.replace("/dashboard/mock-test/result");
    }, 100);
  }

  // Central Submit Effect
  useEffect(() => {
    if (submitRequested && !isSubmitting) {
      submitTestSafe("AUTO_SUBMIT");
    }
  }, [submitRequested, isSubmitting]);

  // Clean Warning Handler
  function handleWarning(reason: string) {
    setWarnings(prev => {
      const next = prev + 1;

      if (next >= 3) {
        alert(
          "CBT WARNING 3/3\n\n" +
          reason +
          "\n\nTest will be submitted now."
        );
        setSubmitRequested(true);
        return 3;
      }

      alert(
        `CBT WARNING ${next}/3\n\n${reason}\n\nDo not repeat this action.`
      );
      return next;
    });
  }

  // Visibility / Tab Switch Effect
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && !isSubmitting) {
        handleWarning("Tab switched or minimized");
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isSubmitting]);

  // Fullscreen Exit Effect
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && !isSubmitting) {
        handleWarning("Exited full screen");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [isSubmitting]);
  
  /* LOAD */
  useEffect(() => {
    async function load() {
      const tSnap = await getDoc(doc(db, "test_series", id));
      if (!tSnap.exists()) return;

      const t = tSnap.data();
      setTitle(t.title || "Mock Test");
      setTimeLeft((t.duration || 60) * 60);

      const qSnap = await getDocs(
        collection(db, "test_series", id, "questions")
      );

      const qs = qSnap.docs.map((d) => {
        const q = d.data();
        return {
          id: d.id,
          text: q.question?.text || q.text || "Question missing",
          options: q.options || [],
          correctAnswer: q.correctAnswer ?? 0,
          explanation: q.explanation || "",
        };
      });

      setQuestions(qs);
      setMarked(new Array(qs.length).fill(false));
      setVisited(new Array(qs.length).fill(false));
      setLoading(false);

      /* FORCE FULLSCREEN */
      document.documentElement.requestFullscreen?.().catch(() => {});
    }

    if (search.get("start")) {
      load();
    }
  }, [id, search]);

  /* TIMER */
  useEffect(() => {
    if (!questions.length || isSubmitting) return;

    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          setSubmitRequested(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [questions, isSubmitting]);
  
  /* VISIT TRACKER */
  useEffect(() => {
    if (questions.length > 0 && !visited[current]) {
      const newVisited = [...visited];
      newVisited[current] = true;
      setVisited(newVisited);
    }
  }, [current, questions, visited]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const q = questions[current];

    if (!q) {
     return (
      <div className="p-10 text-center text-muted-foreground">
        Loading question or test has no questions...
      </div>
    );
  }

  function paletteColor(i: number) {
    if (marked[i]) return "bg-blue-500 text-white";
    if (answers[i] != null) return "bg-green-500 text-white";
    if (visited[i]) return "bg-yellow-400";
    return "bg-gray-200";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between">
        <h1 className="font-bold">{title}</h1>
        <div className="flex gap-4 items-center">
          <span className="text-red-600 font-semibold">
            Warnings: {warnings}/3
          </span>
          <span>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
          <Button variant="destructive" onClick={() => {
              if (confirm("Are you sure you want to submit the test?")) {
                  setSubmitRequested(true);
              }
          }}>
            Submit Test
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* QUESTION */}
        <div className="flex justify-center">
            <div className="w-full max-w-3xl">
                <div className="bg-white border rounded p-5">
                    <p className="font-semibold mb-3">
                    Q{current + 1}. {q.text}
                    </p>

                    <div className="space-y-2">
                    {q.options.map((o, i) => {
                        const label = typeof o === "string" ? o : o.text;
                        return (
                        <label key={i} className="flex items-center gap-2 border rounded p-2 cursor-pointer">
                            <input
                            type="radio"
                            name={`q-${current}`}
                            checked={answers[current] === i}
                            onChange={() => setAnswers({ ...answers, [current]: i })}
                            />{" "}
                            {label}
                        </label>
                        );
                    })}
                    </div>
                </div>

                <div className="flex justify-between mt-4">
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
        </div>

        {/* PALETTE */}
        <div className="bg-white border rounded p-4 h-fit md:sticky md:top-24 min-w-[260px]">
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
