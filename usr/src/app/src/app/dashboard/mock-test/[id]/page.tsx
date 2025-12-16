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

  const [instructionAccepted, setInstructionAccepted] = useState<boolean | null>(null);

  /* 🔒 INSTRUCTION GATE */
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
  const [marked, setMarked] = useState<boolean[]>([]);
  const [visited, setVisited] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600);

  /* 🚨 CBT WARNINGS */
  const [warnings, setWarnings] = useState(0);
  const MAX_WARNINGS = 3;

  /* 🚩 SUBMIT FLAG */
  const [shouldSubmit, setShouldSubmit] = useState(false);

  function violation(reason: string) {
    setWarnings((w) => {
      const next = w + 1;
      alert(
        `⚠ CBT WARNING ${next}/${MAX_WARNINGS}\n\n${reason}\n\n` +
          (next >= MAX_WARNINGS
            ? "Test will be submitted now."
            : "Further violations will auto-submit.")
      );
      if (next >= MAX_WARNINGS) {
        setShouldSubmit(true);
      }
      return next;
    });
  }

  /* LOAD */
  useEffect(() => {
    if (instructionAccepted === true) {
      load();
    }
  }, [instructionAccepted]);

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

  /* TIMER */
  useEffect(() => {
    if (!questions.length || instructionAccepted !== true) return;
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setShouldSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [questions, instructionAccepted]);

  /* CHEAT DETECTION */
  useEffect(() => {
    if (instructionAccepted !== true) return;

    const fs = () => {
      if (!document.fullscreenElement) violation("Exited fullscreen mode");
    };
    const blur = () => violation("Tab switched or minimized");
    const vis = () =>
      document.visibilityState === "hidden" &&
      violation("Tab visibility changed");

    document.addEventListener("fullscreenchange", fs);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", vis);

    window.onbeforeunload = () =>
      "Leaving will submit the test.";

    return () => {
      document.removeEventListener("fullscreenchange", fs);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", vis);
      window.onbeforeunload = null;
    };
  }, [instructionAccepted]);
  
  /* ---------------- VISIT TRACK ---------------- */
  useEffect(() => {
    if (!visited[current]) {
      const v = [...visited];
      v[current] = true;
      setVisited(v);
    }
  }, [current, visited]);


  /* ---------------- CONTROLLED SUBMIT EFFECT ---------------- */
  useEffect(() => {
    if (!shouldSubmit) return;

    setShouldSubmit(false); // prevent double submit

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

    router.push("/dashboard/mock-test/result");
  }, [shouldSubmit, answers, questions, router]);


  if (instructionAccepted === false) {
    return null; // Hard stop - no render
  }

  if (instructionAccepted === null || loading) {
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
            Warnings: {warnings}/{MAX_WARNINGS}
          </span>
          <span>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
          <Button variant="destructive" onClick={() => setShouldSubmit(true)}>
            Submit Test
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* QUESTION */}
        <div className="md:col-span-3 space-y-4 max-w-3xl mx-auto">
          <div className="bg-white border rounded p-5">
            <p className="font-semibold mb-3">
              Q{current + 1}. {q.text}
            </p>

            <div className="space-y-2">
                {q.options.map((opt, i) => {
                    const label = typeof opt === "string" ? opt : opt.text;
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
        <div className="bg-white border rounded p-4 h-fit md:sticky md:top-24">
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
