
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { McqSet } from "@/types/mcq-set";
import { Button } from "../ui/button";
import { X, Check, ArrowLeft, ArrowRight, BookOpen, Clock, FileQuestion } from 'lucide-react';
import { Progress } from "../ui/progress";

type Question = {
  id?: string;
  question: string;
  options: string[]; // options text array
  correctAnswer: string; // index of correct option
  explanation?: string;
};

type Props = {
  setData: McqSet;
  onClose?: () => void;
};

export default function MCQPlayer({ setData, onClose }: Props) {
  const [phase, setPhase] = useState<'instructions' | 'playing' | 'result'>('instructions');
  const questions = (setData.questions || []).filter(q => q.question && q.options?.length > 0 && q.correctAnswer);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(() =>
    setData.timeLimit ? setData.timeLimit * 60 : null
  );

  useEffect(() => {
    if (phase !== 'playing' || timeLeft === null) return;
    if (timeLeft <= 0) {
      setPhase('result');
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => (t !== null ? t - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  function chooseOption(opt: string) {
    if (answers[index] !== undefined) return; // Already answered
    setAnswers(prev => ({...prev, [index]: opt}));
  }

  function goto(i: number) {
    if (i < 0 || i >= questions.length) return;
    setIndex(i);
  }

  function handleSubmit() {
    setPhase('result');
  }

  function handleReset() {
    setAnswers({});
    setPhase('instructions');
    setIndex(0);
    if (setData.timeLimit) setTimeLeft(setData.timeLimit * 60);
  }

  const current = questions[index] || null;

  const { score, total } = useMemo(() => {
    if (phase !== 'result') return { score: 0, total: questions.length };
    const correctAnswers = questions.reduce((acc, q, i) => {
      if (answers[i] === q.correctAnswer) return acc + 1;
      return acc;
    }, 0);
    
    // Save result to local storage
    try {
        const attempt = {
            id: setData.id,
            score: correctAnswers,
            total: questions.length,
            date: new Date().toISOString(),
        };
        localStorage.setItem(`mcq_attempt_${setData.id}`, JSON.stringify(attempt));
    } catch {}

    return { score: correctAnswers, total: questions.length };
  }, [phase, questions, answers, setData.id]);

  const renderContent = () => {
    switch (phase) {
      case 'instructions':
        return <InstructionView setData={setData} onStart={() => setPhase('playing')} />;
      case 'playing':
        return <QuestionView current={current} index={index} total={questions.length} answers={answers} chooseOption={chooseOption} />;
      case 'result':
        return <ResultView questions={questions} answers={answers} score={score} total={total} onReset={handleReset} />;
      default:
        return null;
    }
  };
  
  const renderFooter = () => {
    if (phase === 'playing') {
      return (
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between mb-2">
                <Button variant="outline" onClick={() => goto(index - 1)} disabled={index === 0}><ArrowLeft className="mr-2"/> Prev</Button>
                <div className="text-sm text-gray-600">Question {index + 1} of {questions.length}</div>
                <Button variant="outline" onClick={() => goto(index + 1)} disabled={index === questions.length - 1}>Next <ArrowRight className="ml-2"/></Button>
            </div>
            <Progress value={(index + 1) / questions.length * 100} className="w-full h-2" />
             <div className="mt-4 text-center">
                <Button onClick={handleSubmit} size="lg" className="bg-green-600 hover:bg-green-700">Submit Test</Button>
            </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{setData.title}</h2>
            <p className="text-sm text-gray-500">{setData.subject}</p>
          </div>
          <div className="flex items-center gap-4">
            {timeLeft !== null && phase === 'playing' && <div className="text-sm font-mono p-2 rounded-lg bg-red-100 text-red-700">{formatTime(timeLeft)}</div>}
            <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
          </div>
        </div>

        <div className="flex-grow p-6 overflow-y-auto">
          {renderContent()}
        </div>

        {renderFooter()}
      </div>
    </div>
  );
}

function InstructionView({ setData, onStart }: { setData: McqSet, onStart: () => void }) {
    return (
        <div className="text-center flex flex-col items-center justify-center h-full">
             <div className="bg-primary/10 text-primary rounded-full p-4 mb-6">
                <BookOpen className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold">Instructions</h2>
            <p className="text-muted-foreground mt-2 max-w-md">You are about to start the practice test. Please review the details below.</p>
            <div className="mt-8 space-y-4 text-lg">
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/50">
                    <FileQuestion className="h-6 w-6 text-primary" />
                    <span><strong>{setData.questions?.length || 0}</strong> multiple-choice questions</span>
                </div>
                 {setData.timeLimit && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/50">
                        <Clock className="h-6 w-6 text-primary" />
                        <span><strong>{setData.timeLimit}</strong> minute time limit</span>
                    </div>
                 )}
            </div>
            <Button onClick={onStart} size="lg" className="mt-10">
                Begin Test
            </Button>
        </div>
    );
}

function QuestionView({ current, index, total, answers, chooseOption }: any) {
    if (!current) return <div>Question not found.</div>;
    const selectedOption = answers[index];

    return (
        <div>
            <p className="text-lg font-medium mb-6">{current.question}</p>
            <div className="space-y-3">
            {current.options.map((opt: string, i: number) => (
                <button
                key={i}
                onClick={() => chooseOption(opt)}
                disabled={!!selectedOption}
                className={`p-4 w-full text-left rounded-lg border-2 transition text-base flex items-center gap-4
                    ${selectedOption
                        ? opt === current.correctAnswer
                            ? 'bg-green-100 border-green-400 font-semibold'
                            : opt === selectedOption
                            ? 'bg-red-100 border-red-400'
                            : 'bg-gray-100 border-gray-200'
                        : "bg-white hover:bg-purple-50 hover:border-purple-300 border-gray-200"
                    }
                `}
                >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${selectedOption ? (opt === current.correctAnswer ? 'bg-green-500' : (opt === selectedOption ? 'bg-red-500' : 'bg-gray-400')) : 'bg-gray-400'}`}>
                    {String.fromCharCode(65 + i)}
                </div>
                <span>{opt}</span>
                {selectedOption && opt === current.correctAnswer && <Check className="ml-auto text-green-600" />}
                {selectedOption && opt !== current.correctAnswer && opt === selectedOption && <X className="ml-auto text-red-600" />}

                </button>
            ))}
            </div>
            {selectedOption && current.explanation && (
                <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                    <h4 className="font-bold">Explanation</h4>
                    <p className="text-sm mt-1">{current.explanation}</p>
                </div>
            )}
        </div>
    );
}

function ResultView({ questions, answers, score, total, onReset }: any) {
    const percentage = Math.round((score/total) * 100);
    return (
        <div className="text-center">
            <h2 className="text-3xl font-bold">Test Complete!</h2>
            <p className="text-gray-600 mt-2">You have completed the test.</p>

            <div className="my-8">
                <div className="text-5xl font-extrabold text-primary">{percentage}%</div>
                <div className="text-xl text-gray-700">You answered {score} out of {total} questions correctly.</div>
            </div>

            <Button onClick={onReset} size="lg">Try Again</Button>

             <div className="mt-10 text-left">
                <h3 className="text-xl font-bold mb-4">Review Answers</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-4">
                {questions.map((q: any, i: number) => {
                    const userAnswer = answers[i];
                    const isCorrect = userAnswer === q.correctAnswer;
                    return (
                        <div key={i} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                            <p className="font-semibold">{i+1}. {q.question}</p>
                            <p className="text-sm mt-2">Your answer: <span className={!isCorrect ? 'font-bold text-red-700' : ''}>{userAnswer || 'Not answered'}</span></p>
                            <p className="text-sm">Correct answer: <span className="font-bold text-green-700">{q.correctAnswer}</span></p>
                            {q.explanation && <p className="text-xs text-gray-600 mt-2">Explanation: {q.explanation}</p>}
                        </div>
                    )
                })}
                </div>
            </div>
        </div>
    );
}

function formatTime(sec: number) {
  if (sec < 0) sec = 0;
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
