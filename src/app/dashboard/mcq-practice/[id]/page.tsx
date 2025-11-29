// src/app/dashboard/mcq-practice/[id]/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useMcqSets } from "@/context/mcq-context";
import { useAuth } from "@/hooks/use-auth";

function ProgressBar({ idx, total }: { idx: number; total: number }) {
  const percent = Math.round(((idx + 1) / total) * 100);
  return (
    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
      <div style={{ width: `${percent}%` }} className="h-2 bg-gradient-to-r from-purple-600 to-pink-500 transition-all"></div>
    </div>
  );
}

export default function MCQSetPage() {
  const { id } = useParams();
  const { getById } = useMcqSets();
  const { user } = useAuth();
  const set = useMemo(() => getById(id as string), [getById, id]);

  if (!set) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] p-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold">MCQ set not found</h2>
          <p className="text-gray-600 mt-2">This set isn't available. Go back to the library.</p>
          <Link href="/dashboard/mcq-practice" className="mt-4 inline-block text-purple-700">← Back</Link>
        </div>
      </div>
    );
  }

  const locked = set.isPremium && !(user && user.isPremium);
  const questions = set.questions || [];
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(total).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const current = questions[index];

  const selectOption = (opt: string) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = opt;
      return copy;
    });
  };

  const goNext = () => setIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));

  const handleSubmit = () => setSubmitted(true);

  const correctCount = useMemo(() => {
    return answers.reduce((acc, ans, i) => (ans && ans === (questions[i]?.correctAnswer) ? acc + 1 : acc), 0);
  }, [answers, questions]);

  if (locked) {
    return (
      <div className="min-h-screen bg-[#F8F5FF] p-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border text-center">
          <h2 className="text-2xl font-bold">Premium Content</h2>
          <p className="mt-2 text-gray-600">This MCQ set is premium. Please upgrade to access.</p>
          <Link href="/premium" className="mt-4 inline-block px-4 py-2 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded">Upgrade</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5FF] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-extrabold">{set.title}</h1>
              <p className="text-sm text-gray-500 mt-2">{set.description}</p>
              <div className="mt-3 text-xs text-gray-500">{set.course} • {set.year || "—"} • {set.questionCount || questions.length} Questions</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Q {index + 1} / {total}</div>
              <div className="mt-2"><ProgressBar idx={index} total={total} /></div>
            </div>
          </div>
        </header>

        {!submitted ? (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">Question {index + 1} of {total}</div>
              <div className="text-sm text-gray-600">{set.subject || ""}</div>
            </div>

            {current ? (
              <>
                <div className="text-lg font-semibold mb-4">{current.question}</div>
                <div className="grid gap-3">
                  {current.options.map((opt: string) => {
                    const selected = answers[index] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => selectOption(opt)}
                        className={`text-left p-3 rounded-lg border ${selected ? "border-purple-600 bg-purple-50" : "border-gray-200"} hover:bg-gray-50`}>
                        <span className="font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button onClick={goPrev} className="px-3 py-2 bg-white border rounded">Previous</button>
                    <button onClick={goNext} className="px-3 py-2 bg-white border rounded">Next</button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setAnswers(Array(total).fill(null)); setIndex(0); }} className="px-3 py-2 bg-white border rounded">Reset</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded">Submit</button>
                  </div>
                </div>
              </>
            ) : (
              <div>No question available.</div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold">Results</h2>
            <p className="mt-2 text-gray-600">You scored <span className="font-semibold">{correctCount}</span> out of <span className="font-semibold">{total}</span></p>

            <div className="mt-6 space-y-4">
              {questions.map((q: any, i: number) => {
                const userAns = answers[i];
                const correct = q.correctAnswer;
                const isCorrect = userAns === correct;
                return (
                  <div key={i} className="p-4 border rounded">
                    <div className="font-semibold">Q{i + 1}. {q.question}</div>
                    <div className="mt-2">
                      Your answer: <span className={`${isCorrect ? "text-green-600" : "text-red-600"} font-medium`}>{userAns || "No answer"}</span>
                    </div>
                    <div className="mt-1">Correct answer: <span className="font-medium">{correct}</span></div>
                    {q.explanation && <div className="mt-2 text-gray-600">Explanation: {q.explanation}</div>}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => { setSubmitted(false); setAnswers(Array(total).fill(null)); setIndex(0); }} className="px-4 py-2 bg-white border rounded">Retake</button>
              <Link href="/dashboard/mcq-practice" className="px-4 py-2 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded">Back to Library</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
