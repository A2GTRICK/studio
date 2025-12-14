"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Question = {
  questionText: string;
  options: { text: string }[];
  correctAnswer: string;
  explanation?: string;
};

export default function MockTestReviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const raw = sessionStorage.getItem("mockTestReview");
    if (!raw) return;

    const data = JSON.parse(raw);
    setQuestions(data.questions || []);
    setAnswers(data.answers || {});
  }, []);

  if (!questions.length) {
    return <div className="p-10">No review data found.</div>;
  }

  const q = questions[index];
  const given = answers[index];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Answer Review
      </h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="text-sm text-gray-500">
          Question {index + 1} / {questions.length}
        </div>

        <div className="font-medium">
          {q.questionText}
        </div>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const isCorrect = opt.text === q.correctAnswer;
            const isChosen = opt.text === given;

            let style = "border";
            if (isCorrect) style = "border-green-500 bg-green-50";
            if (isChosen && !isCorrect)
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
            <strong>Explanation:</strong> {q.explanation}
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
            location.href = "/dashboard/mock-test"
          }
        >
          Back to Tests
        </Button>
      </div>
    </div>
  );
}
