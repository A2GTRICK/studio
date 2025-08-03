
'use client';

import type { GenerateQuizOutput } from '@/app/dashboard/ai-quiz-generator/page';
import type { UserAnswers } from '@/app/dashboard/ai-quiz-generator/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, Target, BookOpen, RefreshCw, Bot, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { generateFeedback, type GenerateFeedbackOutput } from '@/ai/flows/generate-feedback';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuizResultsProps {
  quizData: GenerateQuizOutput;
  userAnswers: UserAnswers;
  onRestart: () => void;
}

export function QuizResults({ quizData, userAnswers, onRestart }: QuizResultsProps) {
  const [feedback, setFeedback] = useState<GenerateFeedbackOutput | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const { toast } = useToast();

  const score = React.useMemo(() => {
    return quizData.questions.reduce((acc, question, index) => {
      return userAnswers[index] === question.correctAnswer ? acc + 1 : acc;
    }, 0);
  }, [quizData, userAnswers]);

  const scorePercentage = Math.round((score / quizData.questions.length) * 100);

  const handleGetFeedback = async () => {
    setIsFeedbackLoading(true);
    setFeedback(null);
    try {
      const incorrectQuestions = quizData.questions
        .filter((q, index) => userAnswers[index] !== q.correctAnswer)
        .map((q, index) => {
           const originalIndex = quizData.questions.findIndex(origQ => origQ.question === q.question);
           return {
                question: q.question,
                userAnswer: userAnswers[originalIndex] || "Not Answered",
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
            }
        });

      if (incorrectQuestions.length === 0) {
        toast({
          title: "Perfect Score!",
          description: "No incorrect answers to analyze. Great job!",
        });
        setIsFeedbackLoading(false);
        return;
      }
      
      const response = await generateFeedback({ incorrectQuestions });
      setFeedback(response);

    } catch (error) {
       console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Feedback',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
        setIsFeedbackLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Your Score</CardTitle>
          <CardDescription>You answered {score} out of {quizData.questions.length} questions correctly.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="font-bold text-xl text-primary">{scorePercentage}%</span>
            <Progress value={scorePercentage} className="w-full h-4" />
          </div>
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
            <Button onClick={onRestart}>
                <RefreshCw className="mr-2"/>
                Take Another Quiz
            </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Bot />
                AI Performance Analysis
            </CardTitle>
            <CardDescription>Get personalized feedback on your incorrect answers to help you improve.</CardDescription>
        </CardHeader>
        <CardContent>
          {feedback && !isFeedbackLoading && (
            <div className="p-4 bg-secondary/50 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{feedback.feedback}</ReactMarkdown>
            </div>
          )}
          {isFeedbackLoading && (
             <div className="flex items-center justify-center h-24 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p>Analyzing your performance...</p>
            </div>
          )}
          {!feedback && !isFeedbackLoading && (
             <Button onClick={handleGetFeedback} disabled={isFeedbackLoading}>
                <Sparkles className="mr-2"/>
                Click for AI Performance Analysis
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Detailed Review</CardTitle>
          <CardDescription>Review each question to understand your mistakes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {quizData.questions.map((q, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                      <span className="text-left flex-1">Question {index + 1}: {q.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 px-2">
                        <div className="space-y-2">
                            {q.options.map(option => {
                                const isUserAnswer = userAnswer === option;
                                const isCorrectAnswer = q.correctAnswer === option;
                                
                                return (
                                    <div key={option} className={cn(
                                        "flex items-center gap-2 p-2 rounded-md text-sm",
                                        isCorrectAnswer && "bg-green-100 dark:bg-green-900/30",
                                        isUserAnswer && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/30"
                                    )}>
                                       {isCorrectAnswer && <Target className="h-4 w-4 text-green-600"/>}
                                       {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-destructive"/>}
                                       {!isUserAnswer && !isCorrectAnswer && <div className="w-4 h-4"/>}
                                        <span>{option}</span>
                                        {isCorrectAnswer && <span className="text-xs font-semibold text-green-700 dark:text-green-400 ml-auto">(Correct Answer)</span>}
                                        {isUserAnswer && !isCorrectAnswer && <span className="text-xs font-semibold text-destructive ml-auto">(Your Answer)</span>}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4"/>Explanation</h4>
                            <p className="text-sm text-muted-foreground">{q.explanation}</p>
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
