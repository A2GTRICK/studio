"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchMockTestById } from "@/services/mock-test";
import { Button } from "@/components/ui/button";
import { Loader2, Timer, ChevronLeft, ChevronRight } from "lucide-react";

type AnswerMap = Record<number, string>;

export default function MockTestPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // =============================
  // LOAD TEST
  // =============================
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMockTestById(id);
        setTest(data);
        setTimeLeft((data.duration || 0) * 60);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // =============================
  // TIMER
  // =============================
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin inline" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-10 text-center text-red-600">
        Mock test not found.
      </div>
    );
  }

  const question = test.questions[current];

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  function selectAnswer(option: string) {
    setAnswers((prev) => ({
      ...prev,
      [current]: option,
    }));
  }

  function submitTest() {
    console.log("ANSWERS:", answers);
    alert("Test submitted (logic coming next)");
    router.push("/dashboard/mock-test");
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-xl font-bold">{test.title}</h1>
          <p className="text-sm text-gray-500">
            Question {current + 1} of {test.questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-red-600 font-semibold">
          <Timer className="w-4 h-4" />
          {mins}:{secs.toString().padStart(2, "0")}
        </div>
      </div>

      {/* QUESTION */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {question.questionText}
        </h2>

        <div className="space-y-3">
          {question.options.map((opt: any, idx: number) => {
            const selected = answers[current] === opt.text;
            return (
              <button
                key={idx}
                onClick={() => selectAnswer(opt.text)}
                className={`w-full text-left p-4 border rounded-lg transition ${
                  selected
                    ? "border-primary bg-primary/10"
                    : "hover:bg-slate-50"
                }`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {current === test.questions.length - 1 ? (
          <Button onClick={submitTest}>Submit Test</Button>
        ) : (
          <Button onClick={() => setCurrent((c) => c + 1)}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
