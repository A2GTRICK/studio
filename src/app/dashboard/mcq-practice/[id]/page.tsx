// src/app/dashboard/mcq-practice/[id]/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Send, Repeat, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { McqSet } from "@/context/mcq-context";

const THEME = {
  pageBg: 'bg-[#F3EBFF]',
  card: 'bg-white rounded-2xl shadow-lg border border-[#EDE1FF]',
  accent: 'text-[#6B21A8]',
  accentBg: 'bg-[#EAD8FF]',
};


function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-primary">Question {current + 1} of {total}</span>
        <span className="text-sm font-medium text-primary">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  );
}

export default function MCQSetPage() {
  const { id } = useParams();
  
  const [set, setSet] = useState<McqSet | null>(null);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    if (!id) return;

    async function loadSet() {
      setLoading(true);
      try {
        const res = await fetch(`/api/a2gadmin/mcq?id=${id}`);
        const data = await res.json();
        if (res.ok) {
          setSet(data.set);
        } else {
          console.error("Failed to load set", data.error);
        }
      } catch (err) {
        console.error("Error fetching set", err);
      }
      setLoading(false);
    }
    
    loadSet();
  }, [id]);

  const questions = set?.questions || [];
  const total = questions.length;
  const current = questions[index];

  const correctCount = useMemo(() => {
    if (!submitted) return 0;
    return answers ? Object.entries(answers).reduce((acc, [idx, ans]) => {
        const question = questions[Number(idx)];
        return question && question.correctAnswer === ans ? acc + 1 : acc;
    }, 0) : 0;
  }, [answers, questions, submitted]);
  
  if (loading) {
     return (
      <div className={`min-h-screen ${THEME.pageBg} p-8 flex items-center justify-center`}>
        <div className="text-center">
            <h2 className="text-2xl font-bold">Loading MCQ Set...</h2>
            <p className="text-muted-foreground mt-2">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className={`min-h-screen ${THEME.pageBg} p-8 flex items-center justify-center`}>
        <Card className={`${THEME.card} text-center`}>
            <CardHeader>
                <CardTitle>MCQ Set Not Found</CardTitle>
                <CardDescription>This practice set could not be loaded. It might have been removed.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard/mcq-practice">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Library
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  const selectOption = (opt: string) => {
    setAnswers((prev) => ({...prev, [index]: opt}));
  };

  const goNext = () => setIndex((i) => Math.min(i + 1, total - 1));
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));
  const handleSubmit = () => setSubmitted(true);
  
  const scorePercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const restartQuiz = () => {
    setSubmitted(false);
    setAnswers({});
    setIndex(0);
  };
  
  if (set.isPremium) {
     return (
      <div className={`min-h-screen ${THEME.pageBg} p-8 flex items-center justify-center`}>
        <Card className={`${THEME.card} text-center`}>
            <CardHeader>
                <CardTitle>🔒 Premium Content</CardTitle>
                <CardDescription>This is a premium MCQ set. Upgrade to access.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard/mcq-practice">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Library
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen ${THEME.pageBg} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <Link href="/dashboard/mcq-practice" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to MCQ Library
            </Link>
        </div>
        
        <Card className={`${THEME.card}`}>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">{set.title}</CardTitle>
            <CardDescription className="text-base">{set.description || `A set of ${total} questions on ${set.subject}.`}</CardDescription>
             <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary">{set.course}</Badge>
                <Badge variant="secondary">{set.year || 'All Years'}</Badge>
                <Badge variant="secondary">{set.subject}</Badge>
            </div>
          </CardHeader>
        </Card>

        {!submitted ? (
          <>
            <Card className={`${THEME.card}`}>
              <CardHeader>
                 <ProgressBar current={index} total={total} />
              </CardHeader>
              <CardContent>
                {current ? (
                  <>
                    <p className="font-bold text-lg mb-6">{current.question}</p>
                    <RadioGroup value={answers[index]} onValueChange={selectOption} className="space-y-3">
                      {current.options.map((opt: string) => (
                         <Label key={opt} htmlFor={opt} className={cn(
                            "flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer",
                            answers[index] === opt ? 'border-primary bg-primary/5' : 'border-border'
                         )}>
                           <RadioGroupItem value={opt} id={opt} />
                           <span className="ml-4 text-base">{opt}</span>
                         </Label>
                      ))}
                    </RadioGroup>
                  </>
                ) : (
                  <div>No question available at this index.</div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mt-6">
              <Button variant="outline" onClick={goPrev} disabled={index === 0}>Previous</Button>
              {index === total - 1 ? (
                <Button onClick={handleSubmit} size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    Submit & View Results
                </Button>
              ) : (
                <Button variant="outline" onClick={goNext}>Next</Button>
              )}
            </div>
          </>
        ) : (
          <Card className={`${THEME.card}`}>
            <CardHeader className="text-center">
                <BarChart className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="font-headline text-3xl">Quiz Results</CardTitle>
                <CardDescription>You scored {correctCount} out of {total}</CardDescription>
                <div className="w-full max-w-sm mx-auto pt-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-primary">Your Score</span>
                        <span className="text-sm font-medium text-primary">{scorePercentage}%</span>
                    </div>
                    <Progress value={scorePercentage} className="h-3" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q: any, i: number) => {
                const userAns = answers[i];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={i} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-300 bg-green-50/50' : 'border-red-300 bg-red-50/50'}`}>
                    <p className="font-semibold">Q{i + 1}. {q.question}</p>
                    <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                           <XCircle className={cn("h-5 w-5", isCorrect ? "text-muted-foreground" : "text-red-500")} />
                           <span>Your Answer: <span className={cn(isCorrect ? "text-muted-foreground" : "font-bold text-red-700")}>{userAns || "Not Answered"}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                           <CheckCircle className="h-5 w-5 text-green-500" />
                           <span>Correct Answer: <span className="font-bold text-green-700">{q.correctAnswer}</span></span>
                        </div>
                        {q.explanation && (
                           <div className="pt-2 mt-2 border-t text-muted-foreground">
                                <strong>Explanation:</strong> {q.explanation}
                           </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
            <CardContent className="text-center">
                <Button onClick={restartQuiz} size="lg">
                    <Repeat className="mr-2 h-4 w-4" />
                    Retake This Quiz
                </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}