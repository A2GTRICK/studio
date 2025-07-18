
'use client';
import { useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateMcqPractice, type GenerateMcqPracticeOutput } from '@/ai/flows/generate-mcq-practice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CheckSquare, Loader2, Target, BrainCircuit, Check, X, BookCheck, AlertCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const mcqFormSchema = z.object({
  examType: z.string().min(1, 'Exam type is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  numberOfQuestions: z.number().min(5).max(20),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

type McqFormValues = z.infer<typeof mcqFormSchema>;
type AnswersState = (string | null)[];

export default function McqPracticePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<GenerateMcqPracticeOutput | null>(null);
  const [answers, setAnswers] = useState<AnswersState>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<McqFormValues>({
    resolver: zodResolver(mcqFormSchema),
    defaultValues: {
      examType: 'GPAT',
      subject: '',
      topic: '',
      numberOfQuestions: 10,
      difficulty: 'Medium',
    },
  });

  async function onSubmit(data: McqFormValues) {
    setIsLoading(true);
    setQuestions(null);
    setIsSubmitted(false);
    setAnswers([]);
    try {
      const result = await generateMcqPractice(data);
      setQuestions(result);
      setAnswers(new Array(result.length).fill(null));
    } catch (error) {
      console.error('Error generating MCQs:', error);
      // You can add a toast notification here
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    if (!questions) return 0;
    return questions.reduce((score, question, index) => {
      return score + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  const score = calculateScore();
  const scorePercentage = questions ? (score / questions.length) * 100 : 0;
  
  const getResultIcon = (isCorrect: boolean) => {
    return isCorrect 
      ? <Check className="h-5 w-5 text-green-500" />
      : <X className="h-5 w-5 text-destructive" />;
  }

  const getResultColorClass = (isCorrect: boolean) => {
    return isCorrect ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 lg:sticky top-20">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Target className="text-primary"/> MCQ Practice Generator</CardTitle>
            <CardDescription>Generate high-standard MCQs for competitive exams like GPAT, NIPER, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField control={form.control} name="examType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Exam</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                       <FormControl><SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger></FormControl>
                       <SelectContent>
                        <SelectItem value="GPAT">GPAT</SelectItem>
                        <SelectItem value="NIPER">NIPER</SelectItem>
                        <SelectItem value="Drug Inspector">Drug Inspector</SelectItem>
                        <SelectItem value="Pharmacist Exam">Pharmacist Exam (General)</SelectItem>
                        <SelectItem value="Railway Pharmacist">Railway Pharmacist</SelectItem>
                        <SelectItem value="ESIC Pharmacist">ESIC Pharmacist</SelectItem>
                        <SelectItem value="RRB Pharmacist">RRB Pharmacist</SelectItem>
                        <SelectItem value="AIIMS Pharmacist">AIIMS Pharmacist</SelectItem>
                        <SelectItem value="State Govt. Pharmacist">State Govt. Pharmacist</SelectItem>
                       </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Pharmacology" {...field} disabled={isLoading}/></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="topic" render={({ field }) => (
                  <FormItem><FormLabel>Topic</FormLabel><FormControl><Input placeholder="e.g., Diuretics" {...field} disabled={isLoading}/></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="difficulty" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                       <FormControl><SelectTrigger><SelectValue placeholder="Select Difficulty" /></SelectTrigger></FormControl>
                       <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                       </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
                <FormField control={form.control} name="numberOfQuestions" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Number of Questions: {field.value}</FormLabel>
                      <FormControl>
                          <Slider
                              min={5} max={20} step={1}
                              defaultValue={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              disabled={isLoading}
                          />
                      </FormControl>
                  </FormItem>
                )}/>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Quiz
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <div className="space-y-6">
          {isLoading && (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Generating your custom quiz... please wait.</p>
              </div>
          )}
          {!questions && !isLoading && (
              <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground/50 border-2 border-dashed rounded-lg">
                  <BrainCircuit className="h-16 w-16 mb-4" />
                  <h3 className="text-xl font-semibold">Your Smart Quiz Awaits</h3>
                  <p className="mt-2 max-w-sm">Fill out the form to generate a set of targeted MCQs for your exam preparation.</p>
              </div>
          )}

          {questions && (
            <FormProvider {...form}>
            {isSubmitted && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Quiz Results</CardTitle>
                        <CardDescription>Here's how you performed.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-lg text-muted-foreground">You scored</p>
                        <p className="text-6xl font-bold text-primary my-2">{score} / {questions.length}</p>
                        <Progress value={scorePercentage} className="h-3 my-4" />
                        <p className="font-semibold">{scorePercentage.toFixed(0)}% Correct</p>
                    </CardContent>
                </Card>
            )}

            {questions.map((q, index) => (
              <Card key={index} className={isSubmitted ? getResultColorClass(answers[index] === q.correctAnswer) : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Question {index + 1}</CardTitle>
                    {isSubmitted && getResultIcon(answers[index] === q.correctAnswer)}
                  </div>
                  <CardDescription className="pt-2 text-base text-foreground">{q.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={answers[index] || ''} onValueChange={(val) => handleAnswerChange(index, val)} disabled={isSubmitted}>
                    {q.options.map((option, optIndex) => (
                      <FormItem key={optIndex} className={`flex items-center space-x-3 space-y-0 p-3 rounded-md border ${ isSubmitted && (option === q.correctAnswer ? 'border-green-500 bg-green-500/10' : (answers[index] === option ? 'border-destructive bg-destructive/10' : '')) }`}>
                        <FormControl><RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} /></FormControl>
                        <FormLabel htmlFor={`q${index}-opt${optIndex}`} className="font-normal flex-1 cursor-pointer">
                          {option}
                        </FormLabel>
                        {isSubmitted && (
                            <>
                            {option === q.correctAnswer && <Check className="h-5 w-5 text-green-500" />}
                            {answers[index] === option && option !== q.correctAnswer && <X className="h-5 w-5 text-destructive" />}
                            </>
                        )}
                      </FormItem>
                    ))}
                  </RadioGroup>
                </CardContent>
                {isSubmitted && (
                    <CardFooter>
                       <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="explanation">
                            <AccordionTrigger>
                               <span className="flex items-center gap-2"><BookCheck className="h-4 w-4"/> View Explanation</span>
                            </AccordionTrigger>
                            <AccordionContent className="prose prose-sm dark:prose-invert max-w-none">
                                <p>{q.explanation}</p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    </CardFooter>
                )}
              </Card>
            ))}

            {!isSubmitted && (
                <Button onClick={handleSubmitQuiz} className="w-full" size="lg" disabled={answers.some(a => a === null)}>
                   {answers.some(a => a === null) && <AlertCircle className="mr-2 h-4 w-4"/>}
                   {answers.some(a => a === null) ? 'Please Answer All Questions' : 'Submit Quiz & View Results'}
                </Button>
            )}

            </FormProvider>
          )}

        </div>
      </div>
    </div>
  );
}
