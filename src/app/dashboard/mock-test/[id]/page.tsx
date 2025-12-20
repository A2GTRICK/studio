"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuthSession } from "@/auth/AuthSessionProvider";

type Option = string | { text: string };

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: number;
  explanation?: string;
}

// Helper functions for access control
function daysBetween(date?: string | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function hasActivePremium(userData: any) {
  if (!userData) return false;
  if (userData.isLifetime) return true;
  const days = daysBetween(userData?.premiumUntil);
  return days !== null && days >= 0;
}


export default function CBTMockTestPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const authSession = useAuthSession();
  const user = authSession?.user;

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<boolean[]>([]);
  const [visited, setVisited] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600);

  const [warnings, setWarnings] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitRequested, setSubmitRequested] = useState(false);
  

  useEffect(() => {
    if (authSession.loading) return; // Wait for auth session to resolve

    if (!search.get("start")) {
      router.replace(`/dashboard/mock-test/${id}/instructions`);
      return;
    }

    async function loadAndVerify() {
      const testSnap = await getDoc(doc(db, "test_series", id));
      if (!testSnap.exists()) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const testData = testSnap.data();
      let userHasAccess = false;

      if (testData.isPremium === true) {
        if (user?.uid) {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const hasGrant = userData.grantedTestIds?.includes(id);
            if (hasActivePremium(userData) || hasGrant) {
              userHasAccess = true;
            }
          }
        }
      } else {
        // It's a free test
        userHasAccess = true;
      }

      if (!userHasAccess) {
        setAccessDenied(true);
        setLoading(false);
        // Redirect back to instructions which will show the paywall
        router.replace(`/dashboard/mock-test/${id}/instructions`);
        return;
      }
      
      // If access is granted, load questions
      setTitle(testData.title || "Mock Test");
      setTimeLeft((testData.duration || 60) * 60);

      const qSnap = await getDocs(
        collection(db, "test_series", id, "questions")
      );

      const qs = qSnap.docs.map(d => {
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

      document.documentElement.requestFullscreen?.().catch(() => {});
    }

    loadAndVerify();
  }, [id, search, authSession.loading, user, router]);
  
  
  /* =========================
     SAFE SUBMIT (UNCHANGED)
  ========================= */

  function submitTestSafe(reason: string) {
    if (isSubmitting) return;
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

    setTimeout(() => {
      router.replace("/dashboard/mock-test/result");
    }, 100);
  }

  useEffect(() => {
    if (submitRequested && !isSubmitting) {
      submitTestSafe("AUTO_SUBMIT");
    }
  }, [submitRequested, isSubmitting]);

  /* =========================
     CBT WARNING SYSTEM
  ========================= */

  function handleWarning(reason: string) {
    setWarnings(prev => {
      const next = prev + 1;

      if (next >= 3) {
        alert(
          "CBT RULE VIOLATION (3/3)\n\n" +
            reason +
            "\n\nThe test will now be submitted."
        );
        setSubmitRequested(true);
        return 3;
      }

      alert(
        `CBT WARNING (${next}/3)\n\n${reason}\n\nDo not repeat this action.`
      );
      return next;
    });
  }

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden && !isSubmitting) {
        handleWarning("Tab switched or application minimized");
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isSubmitting]);

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && !isSubmitting) {
        handleWarning("Exited fullscreen mode");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFsChange);
  }, [isSubmitting]);


  /* =========================
     TIMER
  ========================= */

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

  /* VISITED TRACKING */
  useEffect(() => {
    if (questions.length > 0 && !visited[current]) {
      const v = [...visited];
      v[current] = true;
      setVisited(v);
    }
  }, [current, questions, visited]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  
  if (accessDenied) {
      return (
          <div className="p-10 text-center text-red-600">
              Access Denied. You do not have permission to start this premium test.
          </div>
      )
  }

  const q = questions[current];
  if (!q) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        No questions available in this test.
      </div>
    );
  }

  function paletteColor(i: number) {
    if (marked[i]) return "bg-blue-600 text-white";
    if (answers[i] != null) return "bg-green-600 text-white";
    if (visited[i]) return "bg-yellow-400";
    return "bg-gray-200";
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">{title}</h1>
        <div className="flex gap-6 items-center text-sm">
          <span className="text-red-600 font-semibold">
            Warnings: {warnings}/3
          </span>
          <span className="font-mono">
            {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </span>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Submit the test now?")) {
                setSubmitRequested(true);
              }
            }}
          >
            Submit Test
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* QUESTION */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="bg-white border rounded-xl p-6">
              <p className="font-semibold mb-4">
                Q{current + 1}. {q.text}
              </p>

              <div className="space-y-3">
                {q.options.map((o, i) => {
                  const label = typeof o === "string" ? o : o.text;
                  return (
                    <label
                      key={i}
                      className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition ${
                        answers[current] === i
                          ? "border-purple-600 bg-purple-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${current}`}
                        checked={answers[current] === i}
                        onChange={() =>
                          setAnswers({ ...answers, [current]: i })
                        }
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between mt-5">
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
        <div className="bg-white border rounded-xl p-4 h-fit sticky top-24">
          <h2 className="font-semibold mb-3">Question Palette</h2>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`p-2 rounded text-sm font-medium ${paletteColor(i)}`}
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
