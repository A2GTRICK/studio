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
  }, []);

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

  function violation(reason: string) {
    setWarnings((w) => {
      const next = w + 1;
      alert(
        `⚠ CBT WARNING ${next}/${MAX_WARNINGS}\n\n${reason}\n\n` +
          (next >= MAX_WARNINGS
            ? "Test will be submitted now."
            : "Further violations will auto-submit.")
      );
      if (next >= MAX_WARNINGS) submitTest();
      return next;
    });
  }

  /* LOAD */
  useEffect(() => {
    load();
  }, []);

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

  /* CHEAT DETECTION */
  useEffect(() => {
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
  }, []);

  function submitTest() {
    sessionStorage.setItem(
      "mockTestResult",
      JSON.stringify({
        questions,
        answers,
      })
    );
    router.push("/dashboard/mock-test/result");
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const q = questions[current];

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
          <Button variant="destructive" onClick={submitTest}>
            Submit Test
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-6xl mx-auto p-6">
        <p className="font-semibold mb-3">
          Q{current + 1}. {q.text}
        </p>

        {q.options.map((o, i) => {
          const label = typeof o === "string" ? o : o.text;
          return (
            <label key={i} className="block border p-2 rounded mb-2">
              <input
                type="radio"
                checked={answers[current] === i}
                onChange={() =>
                  setAnswers({ ...answers, [current]: i })
                }
              />{" "}
              {label}
            </label>
          );
        })}

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent(current - 1)}
          >
            Previous
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
  );
}
