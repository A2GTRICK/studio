// src/app/practice/test/[id]/player/page.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchTestById, fetchTestQuestions } from '@/services/practice';
import { useRouter, useParams } from 'next/navigation';
import { Question } from '@/types/practice';
import type { Test } from '@/types/practice';

interface AnswerPayload {
  questionId: string;
  given: any;
}

export default function Player() {
  const params = useParams();
  const testId = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [curIndex, setCurIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [warnings, setWarnings] = useState(0);

  // load test & questions (client-side to keep timer on client)
  useEffect(() => {
    if (!testId) return;
    async function load() {
      setLoading(true);
      const t = await fetchTestById(testId);
      const qs = await fetchTestQuestions(testId);
      setTest(t);
      setQuestions(qs);
      setTimeLeft((t?.durationMinutes ?? 10) * 60);
      setLoading(false);
      // start immediately if page opened
      startTimer();
      setStartedAt(Date.now());
      // request fullscreen
      try { document.documentElement.requestFullscreen?.(); } catch {}
    }
    load();

    // anti-cheat: detect tab change
    function handleVisibility() {
      if (document.visibilityState !== 'visible') {
        setWarnings(w => w + 1);
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleVisibility);
      stopTimer();
    }
  }, [testId]);

  function startTimer() {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // auto submit
          stopTimer();
          handleSubmit();
          return 0;
        }
        return t - 1;
      })
    }, 1000);
  }
  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function setAnswer(qid: string, value: any) {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  }

  function renderOptionInput(q: Question, optId: string) {
    if (q.type === 'single') {
      return (
        <input type="radio" checked={answers[q.id] === optId} onChange={() => setAnswer(q.id, optId)} />
      );
    }
    if (q.type === 'multiple') {
      const arr = Array.isArray(answers[q.id]) ? answers[q.id] : [];
      const checked = arr.includes(optId);
      return <input type="checkbox" checked={checked} onChange={() => {
        const next = checked ? arr.filter((x:any)=>x!==optId) : [...arr, optId];
        setAnswer(q.id, next);
      }} />;
    }
    return null;
  }

  async function handleSubmit() {
    if (submitting || !test) return;
    setSubmitting(true);
    stopTimer();
    const payload = {
      testId,
      guestId: `guest_${Math.random().toString(36).slice(2,9)}`,
      timeTakenSeconds: (test.durationMinutes * 60) - timeLeft,
      answers: Object.keys(answers).map(k => ({ questionId: k, given: answers[k] }))
    };
    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.resultId) {
        // open results page
        router.push(`/practice/test/${testId}/result/${data.resultId}`);
      } else {
        alert('Submit failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-10">Loading test...</div>;
  if (!test) return <div className="p-10">Test not found</div>;

  const curQ = questions[curIndex];
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto lg:flex gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{test.title}</h2>
            <div className="text-sm">
              Time Left: <span className="font-mono">{Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</span>
            </div>
          </div>

          <div className="border rounded p-6">
            <div className="mb-4">
              <div className="text-sm text-gray-600">Q {curIndex+1} / {questions.length}</div>
              <div className="prose mt-2" dangerouslySetInnerHTML={{ __html: curQ.question }} />
            </div>

            <div className="space-y-3">
              {curQ.options?.map(opt => (
                <label key={opt.id} className="flex items-center gap-3 p-3 border rounded">
                  {renderOptionInput(curQ, opt.id)}
                  <span dangerouslySetInnerHTML={{ __html: opt.text }} />
                </label>
              ))}

              {/* integer type */}
              {curQ.type === 'integer' && (
                <input type="number" value={answers[curQ.id] ?? ''} onChange={(e) => setAnswer(curQ.id, e.target.value)} className="border p-2 rounded w-36" />
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setCurIndex(i => Math.max(0, i-1))} disabled={curIndex===0} className="px-4 py-2 border rounded">Prev</button>
              <button onClick={() => setCurIndex(i => Math.min(questions.length-1, i+1))} className="px-4 py-2 bg-purple-600 text-white rounded">Next</button>
              <button onClick={handleSubmit} className="ml-auto px-4 py-2 bg-green-600 text-white rounded" disabled={submitting}>Submit Test</button>
            </div>
          </div>
        </div>

        <aside className="w-64 hidden lg:block">
          <div className="p-4 border rounded">
            <h4 className="font-bold">Question Palette</h4>
            <div className="grid grid-cols-4 gap-2 mt-3">
              {questions.map((q, idx) => (
                <button key={q.id} onClick={()=>setCurIndex(idx)} className={`p-2 rounded ${answers[q.id] ? 'bg-green-100' : 'bg-gray-100'}`}>{idx+1}</button>
              ))}
            </div>

            <div className="mt-4 text-sm">
              Warnings: {warnings}
              {warnings >= 3 && <div className="text-red-600 mt-2">Multiple tab switches detected — your attempt may be flagged.</div>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
