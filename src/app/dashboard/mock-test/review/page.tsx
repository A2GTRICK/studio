
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Question = {
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
  explanation?: string;
};

type ReviewData = {
  questions: Question[];
  answers: Record<number, string>;
};

export default function MockTestReviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem("mockTestReview");
    if (!raw) return;

    const data: ReviewData = JSON.parse(raw);
    setQuestions(data.questions || []);
    setAnswers(data.answers || {});
  }, []);

  if (!questions.length) {
    return (
      <div className="p-10 text-center text-gray-600">
        No review data found.
      </div>
    );
  }

  const q = questions[index];
  const given = answers[index];
  const isCorrect = given === q.correctAnswer;
  const isAttempted = !!given;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
      
      {/* MAIN QUESTION AREA */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Answer Review</h1>

        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="text-sm text-gray-500">
            Question {index + 1} / {questions.length}
          </div>

          <div className="font-medium text-gray-800">
            {q.questionText}
          </div>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const correct = opt.text === q.correctAnswer;
              const chosen = opt.text === given;

              let style = "border-gray-200";
              if (correct) style = "border-green-500 bg-green-50";
              if (chosen && !correct)
                style = "border-red-500 bg-red-50";

              return (
                <div
                  key={i}
                  className={`p-3 rounded border ${style}`}
                >
                  {opt.text}
                </div>
              );
            })}
          </div>

          <div className="text-sm">
            <strong>Your Answer:</strong>{" "}
            {given || "Not Answered"}
          </div>

          <div className="text-sm">
            <strong>Correct Answer:</strong>{" "}
            {q.correctAnswer}
          </div>

          {q.explanation && (
            <div className="text-sm bg-slate-50 p-3 rounded">
              <strong>Explanation:</strong>{" "}
              {q.explanation}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            disabled={index === 0}
            onClick={() => setIndex(i => i - 1)}
          >
            Prev
          </Button>

          <Button
            disabled={index === questions.length - 1}
            onClick={() => setIndex(i => i + 1)}
          >
            Next
          </Button>

          <Button
            className="ml-auto"
            onClick={() =>
              (window.location.href =
                "/dashboard/mock-test")
            }
          >
            Back to Mock Tests
          </Button>
        </div>
      </div>

      {/* QUESTION PALETTE */}
      <aside className="bg-white border rounded-xl p-4 h-fit">
        <h3 className="font-semibold mb-3">
          Question Palette
        </h3>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, i) => {
            const ans = answers[i];
            let color = "bg-gray-100 text-gray-700"; // skipped

            if (ans) {
              color =
                ans === q.correctAnswer
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white";
            }

            return (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-9 h-9 rounded text-sm font-semibold ${color}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* LEGEND */}
        <div className="mt-4 text-xs space-y-1">
          <Legend color="bg-green-500" label="Correct" />
          <Legend color="bg-red-500" label="Wrong" />
          <Legend color="bg-gray-100 border" label="Skipped" />
        </div>
      </aside>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-4 h-4 rounded ${color}`}
      />
      <span>{label}</span>
    </div>
  );
}
