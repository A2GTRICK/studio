
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
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuthSession } from "@/auth/AuthSessionProvider";

/* =========================
   TYPES
========================= */

type Option = string | { text: string };

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: number;
  explanation?: string;
}

/* =========================
   PAGE
========================= */

export default function CBTMockTestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const auth = useAuthSession();
  const user = auth?.user;
  const authLoading = auth?.loading;

  /* 🔒 INSTRUCTION GATE */
  const [instructionAccepted, setInstructionAccepted] =
    useState<boolean | null>(null);

  useEffect(() => {
    const accepted = sessionStorage.getItem(`mocktest_${id}_accepted`);
    if (!accepted) {
      router.replace(`/dashboard/mock-test/${id}/instruction`);
      setInstructionAccepted(false);
    } else {
      setInstructionAccepted(true);
    }
  }, [id, router]);

  /* STATE */
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<boolean[]>([]);
  const [visited, setVisited] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);

  /* =========================
     SUBMIT HANDLER (RELIABLE)
  ========================= */

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    let correct = 0;
    let wrong = 0;

    questions.forEach((q, i) => {
      if (answers[i] == null) return;
      if (answers[i] === q.correctAnswer) correct++;
      else wrong++;
    });

    const score = correct - wrong * 0.25;

    // Save attempt if user is logged in
    if (user?.uid) {
      try {
        await addDoc(collection(db, "testAttempts"), {
          testId: id,
          userId: user.uid,
          correct,
          wrong,
          score,
          total: questions.length,
          createdAt: serverTimestamp(),
          answers,
        });
      } catch (e) {
        console.error("Failed to save attempt", e);
      }
    }

    // Store result in sessionStorage for the result page
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
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation ?? "",
        })),
      })
    );

    // Cleanup and redirect
    sessionStorage.removeItem(`mocktest_${id}_accepted`);
    router.push("/dashboard/mock-test/result");
  }


  /* =========================
     LOAD TEST (AUTH SAFE)
  ========================= */

  useEffect(() => {
    if (instructionAccepted !== true || authLoading) return;

    async function load() {
      try {
        const tSnap = await getDoc(doc(db, "test_series", id));
        if (!tSnap.exists()) {
          setLoading(false);
          return;
        }

        const t = tSnap.data();
        setTitle(t.title || "Mock Test");
        setTimeLeft((t.duration || 60) * 60);

        const qSnap = await getDocs(
          query(
            collection(db, "test_series", id, "questions"),
            orderBy("order", "asc")
          )
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
      } catch (e) {
        console.error("Failed to load test", e);
      } finally {
        setLoading(false);
        if (!hasEnteredFullscreen) {
          try {
            document.documentElement.requestFullscreen?.();
            setHasEnteredFullscreen(true);
          } catch {}
        }
      }
    }

    load();
  }, [instructionAccepted, id, authLoading, hasEnteredFullscreen]);

  /* =========================
     TIMER
  ========================= */

  useEffect(() => {
    if (!questions.length || instructionAccepted !== true || isSubmitting) return;

    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [questions, instructionAccepted, isSubmitting]);

  /* =========================
     VISIT TRACK
  ========================= */

  useEffect(() => {
    if (questions.length > 0 && !visited[current]) {
      const v = [...visited];
      v[current] = true;
      setVisited(v);
    }
  }, [current, visited, questions.length]);

  
  /* =========================
     RENDER
  ========================= */

  if (instructionAccepted === false) return null;

  if (instructionAccepted === null || loading || authLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        This test has no questions.
        <div className="mt-4">
          <Button onClick={() => router.push("/dashboard/mock-test")}>
            Back to Mock Tests
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  function paletteColor(i: number) {
    if (marked[i]) return "bg-blue-500 text-white";
    if (answers[i] != null) return "bg-green-500 text-white";
    if (visited[i]) return "bg-yellow-400";
    return "bg-gray-200";
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="font-bold">{title}</h1>
          <div className="flex gap-4 items-center">
            <span>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={() => setShowConfirmDialog(true)}
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
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
                      className="flex items-center gap-2 border rounded p-2 cursor-pointer hover:bg-gray-50 has-[input:checked]:bg-indigo-50 has-[input:checked]:border-indigo-300"
                    >
                      <input
                        type="radio"
                        name={`q-${current}`}
                        checked={answers[current] === i}
                        onChange={() => setAnswers({ ...answers, [current]: i })}
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
      
      {showConfirmDialog && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
                  <h2 className="text-lg font-bold">Confirm Submission</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                      Are you sure you want to end the test? You cannot make any more changes after this.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 border border-green-200 p-2 rounded-md">
                        <div className="text-2xl font-bold text-green-700">{Object.keys(answers).length}</div>
                        <div className="text-xs font-medium">Answered</div>
                    </div>
                     <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-md">
                        <div className="text-2xl font-bold text-yellow-700">{questions.length - Object.keys(answers).length}</div>
                        <div className="text-xs font-medium">Skipped</div>
                    </div>
                     <div className="bg-blue-50 border border-blue-200 p-2 rounded-md">
                        <div className="text-2xl font-bold text-blue-700">{marked.filter(Boolean).length}</div>
                        <div className="text-xs font-medium">Marked</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                      <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                          Go Back
                      </Button>
                      <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
                          {isSubmitting ? "Submitting..." : "Submit Test"}
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
}
