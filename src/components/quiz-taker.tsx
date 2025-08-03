
'use client';

import { useState } from 'react';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import type { UserAnswers } from '@/app/dashboard/ai-quiz-generator/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCheck, History } from 'lucide-react';

interface QuizTakerProps {
  quizData: GenerateQuizOutput;
  onQuizSubmit: (answers: UserAnswers) => void;
}

export function QuizTaker({ quizData, onQuizSubmit }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswers>({});

  const totalQuestions = quizData.questions.length;
  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const answersCount = Object.keys(answers).length;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <CardTitle className="font-headline text-xl">Question {currentQuestionIndex + 1}/{totalQuestions}</CardTitle>
              {currentQuestion.previousYearTag && (
                <Badge variant="secondary" className="mt-2">
                  <History className="mr-1 h-3 w-3" />
                  {currentQuestion.previousYearTag}
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="pt-4 text-base text-foreground leading-relaxed">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={answers[currentQuestionIndex]} onValueChange={handleAnswerChange}>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-md border has-[[data-state=checked]]:bg-secondary has-[[data-state=checked]]:border-primary transition-colors cursor-pointer">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="font-normal text-base cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Previous
        </Button>
        <p className="text-sm text-muted-foreground text-center">{answersCount} of {totalQuestions} answered</p>
        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button onClick={() => onQuizSubmit(answers)} disabled={answersCount === 0} className="bg-green-600 hover:bg-green-700">
            <CheckCheck className="mr-2 h-4 w-4"/>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        )}
      </div>
    </div>
  );
}
