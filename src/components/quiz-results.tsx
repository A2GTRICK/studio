
'use client';

import type { GenerateQuizOutput, GenerateQuizInput } from '@/app/dashboard/ai-quiz-generator/page';
import type { UserAnswers } from '@/app/dashboard/ai-quiz-generator/page';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, Target, BookOpen, RefreshCw, Bot, Sparkles, Loader2, Award, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';
import { generateFeedback, type GenerateFeedbackOutput } from '@/ai/flows/generate-feedback';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface QuizResultsProps {
  quizData: GenerateQuizOutput;
  userAnswers: UserAnswers;
  quizConfig: GenerateQuizInput;
  onRestart: (newConfig?: Partial<GenerateQuizInput>) => void;
}

const feedbackMessages = {
    perfect: [
        "🏆 Flawless Victory! Are you even real? 👽",
        "💯 Perfect score! The Sharma ji's kid of our app.",
        "😎 Genius level unlocked. Even Google asks you for answers.",
    ],
    great: [
        "🎉 Wow, so close! Are you cheating? Just kidding... unless? 😉",
        "🔥 On fire! Your brain is working faster than 5G.",
        "Nice one! You're basically the 'season finale' of awesome.",
    ],
    good: [
        "👍 Not bad, not bad. You're like a Wednesday... not the weekend, but getting there!",
        "👏 Decent effort! You've officially graduated from 'noob' to 'might know something'.",
        "Good job! You didn't fail, you just found ways that won't work. 🧠",
    ],
    bad: [
        "🤔 Hmm... Did you let your pet hamster take the quiz for you? 🐹",
        "😬 Yikes. My grandma scored better, and she thinks WiFi is a type of biscuit.",
        "It's okay! Even 'Ctrl+Z' can't undo this, but you can always try again! 😂",
    ],
};

function getRandomMessage(category: keyof typeof feedbackMessages) {
    const messages = feedbackMessages[category];
    return messages[Math.floor(Math.random() * messages.length)];
}

export function QuizResults({ quizData, userAnswers, quizConfig, onRestart }: QuizResultsProps) {
  const [feedback, setFeedback] = useState<GenerateFeedbackOutput | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const { toast } = useToast();

  const score = React.useMemo(() => {
    return quizData.questions.reduce((acc, question, index) => {
      return userAnswers[index] === question.correctAnswer ? acc + 1 : acc;
    }, 0);
  }, [quizData, userAnswers]);

  const scorePercentage = Math.round((score / quizData.questions.length) * 100);

  const [resultMessage, setResultMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');

  useEffect(() => {
    if (scorePercentage === 100) {
        setResultMessage(getRandomMessage('perfect'));
        setMessageColor('text-green-500');
    }
    else if (scorePercentage >= 80) {
        setResultMessage(getRandomMessage('great'));
        setMessageColor('text-blue-500');
    }
    else if (scorePercentage >= 50) {
        setResultMessage(getRandomMessage('good'));
        setMessageColor('text-amber-600');
    }
    else {
        setResultMessage(getRandomMessage('bad'));
        setMessageColor('text-red-500');
    }
  }, [scorePercentage]);

  const handleGetFeedback = async () => {
    setIsFeedbackLoading(true);
    setFeedback(null);
    try {
      const incorrectQuestions = quizData.questions
        .map((q, index) => ({ ...q, userAnswer: userAnswers[index] }))
        .filter(q => q.userAnswer !== q.correctAnswer)
        .map(q => ({
          question: q.question,
          userAnswer: q.userAnswer || "Not Answered",
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }));

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
  
  const getNextStep = () => {
    if (scorePercentage >= 80) {
      let nextDifficulty: GenerateQuizInput['difficulty'] = 'Hard';
      if (quizConfig.difficulty === 'Easy') nextDifficulty = 'Medium';
      if (quizConfig.difficulty === 'Medium') nextDifficulty = 'Hard';

      return (
        <Button onClick={() => onRestart({ ...quizConfig, difficulty: nextDifficulty })}>
          <Award className="mr-2 h-4 w-4"/>
          Excellent! Try '{nextDifficulty}' difficulty next
        </Button>
      );
    } else {
      return (
        <Button onClick={() => onRestart(quizConfig)}>
          <Repeat className="mr-2 h-4 w-4"/>
          Practice this topic again
        </Button>
      );
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Your Score</CardTitle>
          <CardDescription className={cn("font-medium", messageColor)}>{resultMessage}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="font-bold text-2xl text-primary">{scorePercentage}%</span>
            <Progress value={scorePercentage} className="w-full h-4" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
            {getNextStep()}
            <Button onClick={() => onRestart()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4"/>
                Start a New Quiz
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
             <Button onClick={handleGetFeedback} disabled={isFeedbackLoading || scorePercentage === 100}>
                <Sparkles className="mr-2 h-4 w-4"/>
                {scorePercentage === 100 ? "Perfect Score! No feedback needed." : "Get AI Feedback"}
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
                  <AccordionTrigger className="hover:no-underline p-4">
                    <div className="flex items-start gap-4 w-full">
                      {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" /> : <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />}
                      <span className="text-left flex-1 font-medium text-base">Question {index + 1}: {q.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 px-4 pb-4">
                        <div className="space-y-2">
                            {q.options.map(option => {
                                const isUserAnswer = userAnswer === option;
                                const isCorrectAnswer = q.correctAnswer === option;
                                
                                return (
                                    <div key={option} className={cn(
                                        "flex items-center gap-3 p-3 rounded-md text-sm border",
                                        isCorrectAnswer ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700" : "border-transparent",
                                        isUserAnswer && !isCorrectAnswer && "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700"
                                    )}>
                                       {isCorrectAnswer && <Target className="h-4 w-4 text-green-600 flex-shrink-0"/>}
                                       {isUserAnswer && !isCorrectAnswer && <XCircle className="h-4 w-4 text-destructive flex-shrink-0"/>}
                                       {!isUserAnswer && !isCorrectAnswer && <div className="w-4 h-4 flex-shrink-0"/>}
                                        <span className="flex-1">{option}</span>
                                        {isCorrectAnswer && <span className="text-xs font-semibold text-green-700 dark:text-green-400 ml-auto">(Correct)</span>}
                                        {isUserAnswer && !isCorrectAnswer && <span className="text-xs font-semibold text-destructive ml-auto">(Your Answer)</span>}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4"/>Explanation</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
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
