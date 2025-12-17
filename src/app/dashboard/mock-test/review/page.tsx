
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

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

function ReviewQuestion({
  question,
  questionIndex,
  totalQuestions,
  userAnswerIndex,
  goToPrevious,
  goToNext,
}: {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  userAnswerIndex: number | undefined;
  goToPrevious: () => void;
  goToNext: () => void;
}) {
  const status =
    userAnswerIndex === undefined
      ? 'skipped'
      : userAnswerIndex === question.correctAnswer
      ? 'correct'
      : 'wrong';

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            Question {questionIndex + 1} of {totalQuestions}
          </h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold
              ${
                status === 'correct'
                  ? 'bg-green-100 text-green-700'
                  : status === 'wrong'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }
            `}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        <p className="mt-3 text-base font-semibold text-gray-900">
          {question.text}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isCorrect = idx === question.correctAnswer;
          const isUserAnswer = idx === userAnswerIndex;
          const optionText = typeof option === 'string' ? option : option.text;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-lg border p-3
                ${isCorrect ? 'border-green-400 bg-green-50' : ''}
                ${
                  isUserAnswer && !isCorrect ? 'border-red-400 bg-red-50' : ''
                }
                ${
                  !isCorrect && !isUserAnswer ? 'border-gray-200 bg-white' : ''
                }
              `}
            >
              <div className="mt-1 font-semibold text-gray-700">
                {String.fromCharCode(65 + idx)}.
              </div>
              <div className="flex-1 text-sm text-gray-800">
                {optionText}
                {isCorrect && (
                  <span className="ml-2 rounded bg-green-200 px-2 py-0.5 text-xs font-medium text-green-800">
                    Correct Answer
                  </span>
                )}
                {isUserAnswer && !isCorrect && (
                  <span className="ml-2 rounded bg-red-200 px-2 py-0.5 text-xs font-medium text-red-800">
                    Your Answer
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">
          Explanation
        </h3>
        {question.explanation ? (
          <p className="text-sm text-gray-800 leading-relaxed">
            {question.explanation}
          </p>
        ) : (
          <p className="text-sm italic text-gray-500">
            Explanation not available for this question.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          disabled={questionIndex === 0}
          onClick={goToPrevious}
        >
          Previous
        </Button>
        <Button
          disabled={questionIndex === totalQuestions - 1}
          onClick={goToNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mockTestResult');
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalizedQuestions = parsed.questions.map((q: any) => ({
          ...q,
          text: q.text || q.question?.text,
        }));
        setData({
          questions: normalizedQuestions || [],
          answers: parsed.answers || {},
        });
      }
    } catch (error) {
      console.error('Failed to parse review data from sessionStorage', error);
    }
  }, []);

  const paletteColor = (i: number) => {
    if (!data) return 'bg-gray-200';
    const question = data.questions[i];
    const userAnswerIndex = data.answers[i];
    if (userAnswerIndex == null) return 'bg-gray-200 text-gray-800'; // Skipped
    if (userAnswerIndex === question.correctAnswer)
      return 'bg-green-500 text-white'; // Correct
    return 'bg-red-500 text-white'; // Incorrect
  };

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center p-10 text-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading review data...</span>
        </div>
      </div>
    );
  }

  const { questions, answers } = data;

  if (questions.length === 0) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Review data not available or test had no questions.
      </div>
    );
  }

  const currentQuestion = questions[current];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold text-lg">Answer Review</h1>
        <Button asChild variant="outline">
          <Link href="/dashboard/mock-test">Back to Tests</Link>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
        <div className="max-w-3xl">
          <ReviewQuestion
            question={currentQuestion}
            questionIndex={current}
            totalQuestions={questions.length}
            userAnswerIndex={answers[current]}
            goToPrevious={() => setCurrent((i) => i - 1)}
            goToNext={() => setCurrent((i) => i + 1)}
          />
        </div>

        <div className="bg-white border rounded p-4 h-fit md:sticky md:top-24">
          <h2 className="font-semibold mb-3">Question Palette</h2>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`p-2 rounded text-sm font-medium transition-transform hover:scale-110 ${paletteColor(
                  i
                )} ${
                  current === i ? 'ring-2 ring-offset-2 ring-primary' : ''
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
              Correct
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
              Wrong
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-gray-300 rounded-full"></span>
              Skipped
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
