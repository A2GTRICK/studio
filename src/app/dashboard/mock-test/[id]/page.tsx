"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
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
}

export default function MockTestPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 mins

  /* ---------------- LOAD TEST ---------------- */
  useEffect(() => {
    loadTest();
  }, []);

  async function loadTest() {
    try {
      const testSnap = await getDoc(doc(db, "test_series", id));
      if (!testSnap.exists()) throw new Error("Test not found");

      setTitle(testSnap.data().title ?? "Mock Test");

      const qsSnap = await getDocs(
        collection(db, "test_series", id, "questions")
      );

      const resolved: Question[] = qsSnap.docs.map((d) => {
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
        };
      });

      setQuestions(resolved);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

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

    await addDoc(collection(db, "testAttempts"), {
      testId: id,
      correct,
      wrong,
      score,
      total: questions.length,
      createdAt: serverTimestamp(),
    });

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

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!questions.length) {
    return <div className="p-10 text-center">No questions found.</div>;
  }

  const q = questions[index];

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* LEFT */}
      <div className="md:col-span-3 space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Time Left: {Math.floor(timeLeft / 60)}:
          {String(timeLeft % 60).padStart(2, "0")}
        </p>

        <div className="border rounded-lg p-4">
          <p className="font-semibold mb-3">
            Q{index + 1}. {q.text}
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
                    name={`q-${index}`}
                    checked={answers[index] === i}
                    onChange={() =>
                      setAnswers({ ...answers, [index]: i })
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
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            Previous
          </Button>
          {index === questions.length - 1 ? (
            <Button onClick={submitTest}>Submit Test</Button>
          ) : (
            <Button onClick={() => setIndex(index + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT – PALETTE */}
      <div className="border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold mb-2">Questions</h2>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`p-2 rounded text-sm ${
                answers[i] != null
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
