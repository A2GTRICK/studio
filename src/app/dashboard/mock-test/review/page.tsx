
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Option = string | { text: string };

type Question = {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: number;
  explanation?: string;
};

type ReviewData = {
  questions: Question[];
  answers: Record<number, number>;
};

export default function ReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem("mockTestResult");
    if (raw) {
      const parsed = JSON.parse(raw);
      setData({
        questions: parsed.questions || [],
        answers: parsed.answers || {},
      });
    }
  }, []);

  if (!data || !data.questions.length) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Review data not available.
      </div>
    );
  }

  const q = data.questions[current];
  const selected = data.answers[current];

  function paletteColor(i: number) {
    if (data.answers[i] == null) return "bg-gray-300";
    if (data.answers[i] === data.questions[i].correctAnswer)
      return "bg-green-500 text-white";
    return "bg-red-500 text-white";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">Answer Review</h1>
        <Button
          variant="outline"
          onClick={() =>
            (location.href = "/dashboard/mock-test")
          }
        >
          Back to Tests
        </Button>
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

                const isCorrect = i === q.correctAnswer;
                const isSelected = i === selected;

                let cls =
                  "border rounded p-2 flex gap-2 items-center";

                if (isCorrect)
                  cls += " bg-green-100 border-green-500";
                else if (isSelected)
                  cls += " bg-red-100 border-red-500";

                return (
                  <div key={i} className={cls}>
                    <input
                      type="radio"
                      checked={isSelected}
                      readOnly
                    />
                    <span>{label}</span>

                    {isCorrect && (
                      <span className="ml-auto text-green-700 text-sm font-semibold">
                        Correct Answer
                      </span>
                    )}

                    {isSelected && !isCorrect && (
                      <span className="ml-auto text-red-700 text-sm font-semibold">
                        Your Answer
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {selected == null && (
              <p className="mt-3 text-sm text-yellow-700">
                You skipped this question.
              </p>
            )}
          </div>

          {/* ✅ SOLUTION / EXPLANATION */}
          <div className="bg-white border rounded p-5">
            <h3 className="font-semibold mb-2">
              Solution / Explanation
            </h3>
            <p className="text-sm text-muted-foreground">
              {q.explanation
                ? q.explanation
                : "Explanation not provided for this question."}
            </p>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={current === data.questions.length - 1}
              onClick={() => setCurrent(current + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        {/* PALETTE */}
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-3">
            Question Palette
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {data.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`p-2 rounded text-sm ${paletteColor(i)}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="inline-block w-3 h-3 bg-green-500 mr-2"></span>
              Correct
            </p>
            <p>
              <span className="inline-block w-3 h-3 bg-red-500 mr-2"></span>
              Wrong
            </p>
            <p>
              <span className="inline-block w-3 h-3 bg-gray-300 mr-2"></span>
              Skipped
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
