"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchMockTests } from "@/services/mock-test";

type Question = {
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
  explanation?: string;
};

type MockTest = {
  id: string;
  title: string;
  duration?: number;
  questions: Question[];
};

export default function MockTestPlayerPage() {
  const params = useParams();
  const testId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<MockTest | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef<number | null>(null);

  // LOAD TEST
  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await fetchMockTests();
      const found = all.find(t => t.id === testId) as MockTest | undefined;

      if (found) {
        setTest(found);
        setTimeLeft((found.duration ?? 10) * 60);
        startTimer();
      }
      setLoading(false);
    }
    load();

    return () => stopTimer();
  }, [testId]);

  // TIMER (SAFE)
  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
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

  function selectAnswer(value: string) {
    setAnswers(prev => ({ ...prev, [index]: value }));
  }

  function handleSubmit() {
    if (!test) return;
    stopTimer();

    const totalQuestions = test.questions.length;
    let correct = 0;
    let wrong = 0;

    test.questions.forEach((q, i) => {
      const given = answers[i];
      if (!given) return;
      if (given === q.correctAnswer) correct++;
      else wrong++;
    });

    const skipped = totalQuestions - (correct + wrong);

    const marksPerQuestion = 1;
    const negativeMark = 0.25;

    const score =
      correct * marksPerQuestion -
      wrong * negativeMark;

    sessionStorage.setItem(
      "mockTestResult",
      JSON.stringify({
        totalQuestions,
        attempted: correct + wrong,
        correct,
        wrong,
        skipped,
        score: score.toFixed(2),
      })
    );

    sessionStorage.setItem(
      "mockTestReview",
      JSON.stringify({
        questions: test.questions,
        answers,
      })
    );

    window.location.href = "/dashboard/mock-test/result";
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="w-6 h-6 animate-spin inline" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="p-10 text-center text-gray-600">
        Test not found.
      </div>
    );
  }

  const q = test.questions[index];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">{test.title}</h1>
        <div className="font-mono text-red-600">
          {Math.floor(timeLeft / 60)
            .toString()
            .padStart(2, "0")}
          :
          {(timeLeft % 60)
            .toString()
            .padStart(2, "0")}
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <div className="text-sm text-gray-500 mb-2">
          Question {index + 1} / {test.questions.length}
        </div>

        <div className="font-medium mb-4">
          {q.questionText}
        </div>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className="flex items-center gap-3 p-3 border rounded cursor-pointer"
            >
              <input
                type="radio"
                checked={answers[index] === opt.text}
                onChange={() => selectAnswer(opt.text)}
              />
              {opt.text}
            </label>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex(i => i - 1)}
          >
            Prev
          </Button>

          <Button
            onClick={() =>
              setIndex(i =>
                Math.min(test.questions.length - 1, i + 1)
              )
            }
          >
            Next
          </Button>

          <Button
            className="ml-auto bg-green-600"
            onClick={handleSubmit}
          >
            Submit Test
          </Button>
        </div>
      </div>
    </div>
  );
}
