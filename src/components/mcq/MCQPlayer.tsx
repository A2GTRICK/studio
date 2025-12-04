"use client";

import React, { useEffect, useMemo, useState } from "react";

type Question = {
  id?: string;
  q: string;
  options: string[]; // options text array
  answer: number; // index of correct option
  explanation?: string;
};

type Props = {
  setData: {
    id: string;
    title: string;
    questions: Question[];
    timeLimit?: number; // minutes
  };
  onClose?: () => void;
};

export default function MCQPlayer({ setData, onClose }: Props) {
  const questions = setData.questions || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    () => JSON.parse(localStorage.getItem(`mcq_progress_${setData.id}`) || "[]")
  );
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(() =>
    setData.timeLimit ? setData.timeLimit * 60 : null
  );

  useEffect(() => {
    // persist progress
    localStorage.setItem(`mcq_progress_${setData.id}`, JSON.stringify(answers));
  }, [answers, setData.id]);

  useEffect(() => {
    if (!timeLeft) return;
    const t = setInterval(() => setTimeLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft <= 0) {
      // auto-submit
      handleSubmit();
    }
  }, [timeLeft]);

  function chooseOption(optIndex: number) {
    const copy = answers.slice();
    copy[index] = optIndex;
    setAnswers(copy);
  }

  function goto(i: number) {
    if (i < 0 || i >= questions.length) return;
    setIndex(i);
  }

  function handleSubmit() {
    // calculate score
    const correct = questions.reduce((acc, q, i) => {
      const a = answers[i];
      if (typeof a === "number" && a === q.answer) return acc + 1;
      return acc;
    }, 0);

    // Save attempt summary in localStorage
    const scorePercent = Math.round((correct / questions.length) * 100);
    const store = {
      score: correct,
      total: questions.length,
      scoreCount: `${correct}/${questions.length} (${scorePercent}%)`,
      timestamp: Date.now(),
    };
    localStorage.setItem(`mcq_attempt_${setData.id}`, JSON.stringify(store));
    // clear progress key
    localStorage.removeItem(`mcq_progress_${setData.id}`);

    setShowResult(true);
  }

  function handleReset() {
    setAnswers([]);
    localStorage.removeItem(`mcq_progress_${setData.id}`);
    setShowResult(false);
    setIndex(0);
    if (setData.timeLimit) setTimeLeft(setData.timeLimit * 60);
  }

  const current = questions[index] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 p-6">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{setData.title}</h2>
            <div className="text-sm text-gray-500">{questions.length} questions</div>
          </div>

          <div className="flex items-center gap-3">
            {timeLeft !== null && <div className="text-sm font-mono">{formatTime(timeLeft)}</div>}
            <button onClick={() => { onClose?.(); }} className="px-3 py-1 border rounded">Close</button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {!showResult ? (
              <>
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Question {index + 1} / {questions.length}</div>
                  <div className="mt-2 text-base font-medium" dangerouslySetInnerHTML={{ __html: sanitizeHTML(current?.q || "") }} />
                </div>

                <div className="space-y-3">
                  {current?.options?.map((opt, i) => {
                    const selected = answers[index] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => chooseOption(i)}
                        className={`w-full text-left border rounded p-3 ${selected ? "border-purple-600 bg-purple-50" : ""}`}
                      >
                        <span className="inline-block w-6 text-sm font-mono mr-2">{String.fromCharCode(65 + i)}</span>
                        <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt) }} />
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button className="px-3 py-1 border rounded" onClick={() => goto(index - 1)} disabled={index === 0}>Prev</button>
                  <button className="px-3 py-1 border rounded" onClick={() => goto(index + 1)} disabled={index === questions.length - 1}>Next</button>

                  <div className="ml-auto flex items-center gap-2">
                    <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setIndex(0)}>First</button>
                    <button className="px-3 py-1 rounded bg-gray-100" onClick={() => setIndex(questions.length - 1)}>Last</button>
                    <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={handleSubmit}>Submit</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">Result</h3>
                </div>

                <ResultView questions={questions} answers={answers} />

                <div className="flex gap-2 mt-4">
                  <button onClick={handleReset} className="px-3 py-1 border rounded">Retry</button>
                  <button onClick={() => onClose?.()} className="px-3 py-1 border rounded">Close</button>
                </div>
              </>
            )}
          </div>

          <aside className="bg-gray-50 p-3 rounded lg:col-span-1">
            <h4 className="font-medium mb-2">Navigation</h4>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((q, i) => {
                const answered = typeof answers[i] === "number";
                return (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`p-2 text-sm rounded ${i === index ? "bg-purple-600 text-white" : answered ? "bg-green-100" : "bg-white border"}`}
                    title={`Go to Q ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div><strong>Answered:</strong> {answers.filter((a) => typeof a === "number").length}/{questions.length}</div>
              <div className="mt-2"><strong>Saved to:</strong> browser storage</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* small utilities */

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function sanitizeHTML(s: string) {
  // minimal sanitization (no external libs). If you already include DOMPurify on page-level, prefer that.
  if (!s) return "";
  // allow basic tags; escape angle brackets otherwise
  return s
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

function ResultView({ questions, answers }: { questions: any[]; answers: number[] }) {
  const total = questions.length;
  const correct = questions.reduce((acc, q, i) => {
    if (typeof answers[i] === "number" && answers[i] === q.answer) return acc + 1;
    return acc;
  }, 0);

  return (
    <div>
      <div className="text-lg mb-4">Score: <strong>{correct}</strong> / {total} ({Math.round((correct / total) * 100)}%)</div>

      <div className="space-y-3">
        {questions.map((q, i) => {
          const sel = answers[i];
          const isCorrect = typeof sel === "number" && sel === q.answer;
          return (
            <div key={i} className="p-3 bg-white border rounded">
              <div className="text-sm text-gray-600 mb-2">Q {i + 1}</div>
              <div className="mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHTML(q.q) }} />
              <div className="grid gap-2">
                {q.options.map((opt: string, idx: number) => {
                  const correctOpt = idx === q.answer;
                  const selectedOpt = idx === sel;
                  return (
                    <div key={idx} className={`p-2 rounded ${correctOpt ? "bg-green-50 border-green-200" : selectedOpt ? "bg-red-50 border-red-200" : "bg-white border"}`}>
                      <div className="font-mono inline-block w-6 mr-2">{String.fromCharCode(65 + idx)}</div>
                      <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(opt) }} />
                      {correctOpt && <span className="ml-2 text-xs text-green-800"> (Correct)</span>}
                      {selectedOpt && !correctOpt && <span className="ml-2 text-xs text-red-800"> (Your answer)</span>}
                    </div>
                  );
                })}
              </div>

              {q.explanation && <div className="mt-2 text-sm text-gray-600">Explanation: <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(q.explanation) }} /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
