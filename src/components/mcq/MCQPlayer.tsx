"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  X, Check, ArrowLeft, ArrowRight, BookOpen, Clock, 
  FileQuestion, Trophy, Target, AlertCircle, ChevronRight,
  RotateCcw, Info, Lock, Zap, Crown, Sparkles
} from 'lucide-react';

const ATTEMPT_LIMIT = 3;

const Progress = ({ value, className = "" }: { value: number, className?: string }) => (
  <div className={`w-full bg-gray-100 rounded-full h-2 overflow-hidden ${className}`}>
    <div 
      className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
      style={{ width: `${value || 0}%` }} 
    />
  </div>
);

const Button = ({ children, variant = "primary", size = "md", className = "", disabled = false, onClick, ...props }: { children: React.ReactNode, variant?: string, size?: string, className?: string, disabled?: boolean, onClick?: React.MouseEventHandler<HTMLButtonElement> }) => {
  const variants: { [key: string]: string } = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-95",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:scale-95",
    outline: "bg-transparent border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:scale-95",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-95",
    premium: "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 shadow-lg active:scale-95"
  };
  const sizes: { [key: string]: string } = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg font-semibold",
    icon: "p-2"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function MCQPlayer({ setData, onClose }: { setData: any, onClose: () => void }) {
  const [phase, setPhase] = useState<'instructions' | 'playing' | 'result'>('instructions');
  const [attempts, setAttempts] = useState(0);
  
  const questions = useMemo(() => {
    if (!setData || !setData.questions) return [];
    return setData.questions.filter((q: any) => q && q.question && q.options?.length > 0 && q.correctAnswer);
  }, [setData]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(() =>
    setData?.timeLimit ? setData.timeLimit * 60 : null
  );

  // Load and track attempts from localStorage
  useEffect(() => {
    if (setData?.id) {
      const stored = localStorage.getItem(`mcq_attempts_count_${setData.id}`);
      setAttempts(stored ? parseInt(stored) : 0);
    }
  }, [setData?.id]);

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
    if (answers[index] !== undefined) return;
    setAnswers(prev => ({ ...prev, [index]: opt }));
  }

  function goto(i: number) {
    if (i < 0 || i >= questions.length) return;
    setIndex(i);
  }

  function handleSubmit() {
    // Increment attempts on submission
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (setData?.id) {
      localStorage.setItem(`mcq_attempts_count_${setData.id}`, nextAttempts.toString());
    }
    setPhase('result');
  }

  function handleReset() {
    setAnswers({});
    setPhase('instructions');
    setIndex(0);
    if (setData?.timeLimit) setTimeLeft(setData.timeLimit * 60);
  }

  const current = questions[index] || null;

  const { score, total } = useMemo(() => {
    if (phase !== 'result') return { score: 0, total: questions.length };
    const correctCount = questions.reduce((acc, q, i) => {
      if (answers[i] === q.correctAnswer) return acc + 1;
      return acc;
    }, 0);

    try {
      if (setData?.id) {
        const attempt = {
          id: setData.id,
          score: correctCount,
          total: questions.length,
          date: new Date().toISOString(),
        };
        localStorage.setItem(`mcq_attempt_log_${setData.id}_${Date.now()}`, JSON.stringify(attempt));
      }
    } catch (e) {
      console.warn("Storage error:", e);
    }

    return { score: correctCount, total: questions.length };
  }, [phase, questions, answers, setData]);

  if (!setData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl flex items-center gap-4">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading Assessment...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Check for lock condition
    if (attempts >= ATTEMPT_LIMIT && phase !== 'result') {
      return <PremiumPaywallView onUpgrade={() => console.log('Upgrade clicked')} />;
    }

    switch (phase) {
      case 'instructions':
        return <InstructionView setData={setData} onStart={() => setPhase('playing')} attemptsLeft={ATTEMPT_LIMIT - attempts} />;
      case 'playing':
        return (
          <QuestionView 
            current={current} 
            index={index} 
            total={questions.length} 
            answers={answers} 
            chooseOption={chooseOption}
            onNavigate={goto}
          />
        );
      case 'result':
        return <ResultView questions={questions} answers={answers} score={score} total={total} onReset={handleReset} attemptsUsed={attempts} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 sm:p-6 font-sans">
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        <header className="flex items-center justify-between px-6 py-5 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 leading-tight">{setData?.title || "Assessment"}</h2>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <span className="px-2 py-0.5 bg-slate-100 rounded-md uppercase tracking-wider text-[10px]">{setData?.subject || "Practice"}</span>
                <span>•</span>
                <span>{questions.length} Questions</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {timeLeft !== null && phase === 'playing' && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-colors ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                <Clock className="w-4 h-4" />
                <span className="font-bold font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto bg-[#F8FAFC]">
          <div className="max-w-4xl mx-auto p-6 sm:p-10 h-full">
            {renderContent()}
          </div>
        </main>

        {phase === 'playing' && attempts < ATTEMPT_LIMIT && (
          <footer className="px-6 py-5 border-t bg-white flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Button 
                variant="secondary" 
                onClick={() => goto(index - 1)} 
                disabled={index === 0}
                className="w-32"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>

              <div className="flex-grow hidden sm:flex justify-center">
                <div className="flex gap-1.5 overflow-x-auto max-w-md p-1 no-scrollbar">
                  {questions.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => goto(i)}
                      className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all ${
                        index === i 
                          ? 'bg-indigo-600 text-white' 
                          : answers[i] 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {index === questions.length - 1 ? (
                <Button variant="success" onClick={handleSubmit} className="w-32">
                  Submit <Check className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button variant="primary" onClick={() => goto(index + 1)} className="w-32">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 min-w-max uppercase tracking-widest">Progress</span>
              <Progress value={questions.length > 0 ? ((index + 1) / questions.length) * 100 : 0} />
              <span className="text-xs font-bold text-indigo-600 min-w-max">
                {questions.length > 0 ? Math.round(((index + 1) / questions.length) * 100) : 0}%
              </span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

function InstructionView({ setData, onStart, attemptsLeft }: { setData: any, onStart: () => void, attemptsLeft: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-xl">
          <BookOpen className="h-16 w-16 text-indigo-600" />
        </div>
      </div>
      
      <h2 className="text-4xl font-extrabold text-slate-900 text-center">Ready to begin?</h2>
      <p className="text-slate-500 mt-4 text-center text-lg">
        Master <span className="text-indigo-600 font-semibold">{setData?.subject || "this topic"}</span> through focused practice.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 w-full">
        <div className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <FileQuestion className="h-8 w-8 text-indigo-500 mb-3" />
          <span className="text-slate-900 font-bold text-xl">{setData?.questions?.length || 0}</span>
          <span className="text-slate-500 text-sm">Questions</span>
        </div>
        <div className="flex flex-col items-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
          <RotateCcw className="h-8 w-8 text-amber-500 mb-3" />
          <span className="text-slate-900 font-bold text-xl">{attemptsLeft}</span>
          <span className="text-slate-500 text-sm">Free Retries Left</span>
        </div>
      </div>

      <div className="mt-12 w-full space-y-3 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
        <div className="flex items-start gap-3 text-indigo-800 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>You have {attemptsLeft} free attempts remaining for this module. Retaking helps reinforce memory.</p>
        </div>
      </div>

      <Button onClick={onStart} size="lg" className="mt-10 w-full sm:w-auto px-12 py-6 rounded-2xl text-xl">
        Start Assessment
      </Button>
    </div>
  );
}

function PremiumPaywallView({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 text-center">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-amber-100">
          <Lock className="h-16 w-16 text-amber-500" />
          <div className="absolute -top-2 -right-2 bg-indigo-600 rounded-full p-2 shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <h2 className="text-4xl font-black text-slate-900 leading-tight">
        Practice Limit Reached
      </h2>
      <p className="text-slate-500 mt-4 text-lg">
        You've completed your 3 free attempts for this module. Unlock <span className="text-indigo-600 font-bold">Premium Access</span> to keep practicing and mastering this subject.
      </p>

      <div className="mt-10 w-full space-y-4">
        <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-left">
          <div className="bg-emerald-100 p-2 rounded-lg"><Sparkles className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <p className="font-bold text-slate-800">Unlimited Retries</p>
            <p className="text-xs text-slate-500 text-balance">Practice as many times as you need to get 100%.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-left">
          <div className="bg-indigo-100 p-2 rounded-lg"><Zap className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <p className="font-bold text-slate-800">Advanced Analytics</p>
            <p className="text-xs text-slate-500">Track your performance improvement over time.</p>
          </div>
        </div>
      </div>

      <Button variant="premium" size="lg" className="mt-10 w-full py-6 rounded-2xl text-xl shadow-amber-200" onClick={onUpgrade}>
        Unlock Premium Access
      </Button>
      
      <p className="mt-6 text-slate-400 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Joining 10,000+ students already mastering their exams.
      </p>
    </div>
  );
}

function QuestionView({ current, index, total, answers, chooseOption }: { current: any, index: number, total: number, answers: Record<number, string>, chooseOption: (opt: string) => void }) {
  if (!current) return <div className="flex items-center justify-center h-full text-slate-400">Question not found.</div>;
  const selectedOption = answers[index];

  return (
    <div className="animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-8">
        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-full text-sm uppercase tracking-wider">
          Question {index + 1}
        </span>
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 leading-snug mb-10">
        {current.question}
      </h3>

      <div className="space-y-4">
        {(current.options || []).map((opt: string, i: number) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === current.correctAnswer;
          const showFeedback = !!selectedOption;

          let styles = "bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30";
          let iconBg = "bg-slate-100 text-slate-500";

          if (showFeedback) {
            if (isCorrect) {
              styles = "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm";
              iconBg = "bg-emerald-500 text-white";
            } else if (isSelected) {
              styles = "bg-red-50 border-red-500 text-red-900 shadow-sm";
              iconBg = "bg-red-500 text-white";
            } else {
              styles = "bg-slate-50 border-slate-100 opacity-60 text-slate-400";
              iconBg = "bg-slate-200 text-slate-400";
            }
          } else {
            if (isSelected) styles = "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/10";
          }

          return (
            <button
              key={i}
              onClick={() => chooseOption(opt)}
              disabled={showFeedback}
              className={`group flex items-center gap-5 p-5 w-full text-left rounded-2xl border-2 transition-all duration-200 ${styles}`}
            >
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg transition-colors ${iconBg}`}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className="flex-grow font-medium text-lg">{opt}</span>
              {showFeedback && isCorrect && <div className="bg-emerald-500 rounded-full p-1"><Check className="w-5 h-5 text-white" /></div>}
              {showFeedback && isSelected && !isCorrect && <div className="bg-red-500 rounded-full p-1"><X className="w-5 h-5 text-white" /></div>}
            </button>
          );
        })}
      </div>

      {selectedOption && current.explanation && (
        <div className="mt-10 p-6 rounded-3xl bg-amber-50 border border-amber-100 text-amber-900 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-wider text-xs text-amber-700">
            <Info className="w-4 h-4" /> Learning Insight
          </div>
          <p className="text-base leading-relaxed font-medium">{current.explanation}</p>
        </div>
      )}
    </div>
  );
}

function ResultView({ questions, answers, score, total, onReset, attemptsUsed }: { questions: any[], answers: Record<number, string>, score: number, total: number, onReset: () => void, attemptsUsed: number }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const isLocked = attemptsUsed >= ATTEMPT_LIMIT;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-700 pb-10">
      <div className="bg-white rounded-[3rem] p-8 sm:p-12 shadow-xl border border-slate-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-100/50 blur-[100px] rounded-full -z-10"></div>
        <div className="inline-flex p-4 bg-indigo-50 rounded-3xl mb-6"><Trophy className="w-12 h-12 text-indigo-600" /></div>
        <h2 className="text-4xl font-extrabold text-slate-900">Practice Complete</h2>
        <p className="text-slate-500 mt-2 text-lg">Your knowledge is growing. Keep up the momentum!</p>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-10 mt-12 py-8 px-6 bg-slate-50 rounded-[2rem]">
          <div className="flex flex-col items-center">
            <div className="text-6xl font-black text-indigo-600 mb-1">{percentage}%</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Score</div>
          </div>
          <div className="h-px w-20 sm:w-px sm:h-20 bg-slate-200"></div>
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{score}</div>
              <div className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Correct</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">{total - score}</div>
              <div className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Mistakes</div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button onClick={onReset} size="lg" className="rounded-2xl px-10">
            {isLocked ? <><Lock className="w-5 h-5 mr-2" /> Upgrade to Retake</> : <><RotateCcw className="w-5 h-5 mr-2" /> Retake Practice</>}
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6 px-2">
          <Target className="w-6 h-6 text-indigo-600" /> Review Questions
        </h3>
        <div className="space-y-6">
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            return (
              <div key={i} className={`p-6 rounded-3xl border-2 ${isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-grow">
                    <p className="text-lg font-bold text-slate-800">{q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="p-3 rounded-xl bg-white/60 border border-slate-100">
                        <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Your Answer</span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{userAnswer || 'Skipped'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white/60 border border-slate-100">
                        <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Correct Choice</span>
                        <span className="font-semibold text-emerald-700">{q.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
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
