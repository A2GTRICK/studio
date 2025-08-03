
'use client';

import { useState } from 'react';
import { QuizGeneratorSetup } from '@/components/quiz-generator-form';
import { QuizTaker } from '@/components/quiz-taker';
import { QuizResults } from '@/components/quiz-results';
import { FileQuestion, Bot, BarChart } from 'lucide-react';
import { z } from 'zod';

const GenerateQuizInputSchema = z.object({
  targetExam: z.string().describe('The target competitive exam (e.g., GPAT, NIPER).'),
  subject: z.string().describe('The subject of the quiz.'),
  topic: z.string().optional().describe('The specific topic or chapter within the subject.'),
  numQuestions: z.number().min(5).max(20).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the questions.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The question text.'),
      options: z.array(z.string()).length(4).describe('An array of four possible answers.'),
      correctAnswer: z.string().describe('The correct answer from the options array.'),
      explanation: z.string().describe('A detailed explanation for why the answer is correct.'),
    })
  ).describe('An array of quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export type QuizPhase = 'setup' | 'quiz' | 'results';
export type UserAnswers = Record<number, string>;

export default function AiQuizGeneratorPage() {
  const [quizPhase, setQuizPhase] = useState<QuizPhase>('setup');
  const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [quizConfig, setQuizConfig] = useState<GenerateQuizInput | null>(null);


  const handleQuizGenerated = (data: GenerateQuizOutput, config: GenerateQuizInput) => {
    setQuizData(data);
    setQuizConfig(config);
    setQuizPhase('quiz');
  };

  const handleQuizSubmit = (answers: UserAnswers) => {
    setUserAnswers(answers);
    setQuizPhase('results');
  };

  const handleRestart = () => {
    setQuizData(null);
    setUserAnswers({});
    setQuizConfig(null);
    setQuizPhase('setup');
  };

  const renderPhase = () => {
    switch (quizPhase) {
      case 'setup':
        return (
          <div>
            <div className="flex items-center gap-2">
              <FileQuestion className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-3xl font-bold tracking-tight">AI Quiz Generator</h1>
            </div>
            <p className="text-muted-foreground">Configure your exam practice session below.</p>
            <div className="mt-8">
              <QuizGeneratorSetup onQuizGenerated={handleQuizGenerated} />
            </div>
          </div>
        );
      case 'quiz':
        return quizData && quizConfig && (
          <div>
            <div className="flex items-center gap-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-3xl font-bold tracking-tight">Quiz in Progress</h1>
            </div>
            <p className="text-muted-foreground">
              Exam: {quizConfig.targetExam} | Subject: {quizConfig.subject}
              {quizConfig.topic && ` | Topic: ${quizConfig.topic}`}
            </p>
            <div className="mt-8">
              <QuizTaker quizData={quizData} onQuizSubmit={handleQuizSubmit} />
            </div>
          </div>
        );
      case 'results':
        return quizData && (
          <div>
            <div className="flex items-center gap-2">
                <BarChart className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-3xl font-bold tracking-tight">Quiz Results</h1>
            </div>
            <p className="text-muted-foreground">Check your performance and review the explanations.</p>
            <div className="mt-8">
              <QuizResults quizData={quizData} userAnswers={userAnswers} onRestart={handleRestart} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="w-full">{renderPhase()}</div>;
}

