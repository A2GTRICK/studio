
'use client';
import { useState, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateMcqPractice, type GenerateMcqPracticeOutput } from '@/ai/flows/generate-mcq-practice';
import { generateMcqFeedback } from '@/ai/flows/generate-mcq-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CheckSquare, Loader2, Target, BrainCircuit, Check, X, BookCheck, AlertCircle, RefreshCcw, Share2, PlusCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { marked } from 'marked';


const mcqFormSchema = z.object({
  examType: z.string().min(1, 'Exam type is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  numberOfQuestions: z.number().min(5).max(20),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

type McqFormValues = z.infer<typeof mcqFormSchema>;

type ShuffledQuestion = GenerateMcqPracticeOutput[0] & { shuffledOptions: string[] };

type AnswersState = (string | null)[];

// Helper function to shuffle an array
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export default function McqPracticePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [questions, setQuestions] = useState<ShuffledQuestion[] | null>(null);
  const [answers, setAnswers] = useState<AnswersState>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const { toast } = useToast();

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

  const resetQuiz = (showToast = false) => {
    setIsSubmitted(false);
    setAiFeedback(null);
    setAnswers(new Array(questions?.length || 0).fill(null));
    if (showToast) {
        toast({ title: "Quiz Reset!", description: "You can now attempt the quiz again." });
    }
  }

  const practiceAnotherTopic = () => {
    setQuestions(null);
    setIsSubmitted(false);
    setAnswers([]);
    setAiFeedback(null);
    form.reset({
      examType: 'GPAT',
      subject: '',
      topic: '',
      numberOfQuestions: 10,
      difficulty: 'Medium',
    });
  }

  async function onSubmit(data: McqFormValues) {
    setIsLoading(true);
    setQuestions(null);
    setIsSubmitted(false);
    setAnswers([]);
    setAiFeedback(null);
    try {
      const result = await generateMcqPractice(data);
      const shuffledResult = result.map(q => ({
        ...q,
        shuffledOptions: shuffleArray([...q.options]),
      }));
      setQuestions(shuffledResult);
      setAnswers(new Array(result.length).fill(null));
    } catch (error) {
      console.error('Error generating MCQs:', error);
      toast({
          title: "Error",
          description: "Failed to generate the quiz. Please try again.",
          variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const regenerateQuiz = () => {
    const currentValues = form.getValues();
    onSubmit(currentValues);
  }
  
  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitted(true);
    setIsFeedbackLoading(true);
    setAiFeedback(null);

    if (!questions) {
        setIsFeedbackLoading(false);
        return;
    }

    try {
        const quizPerformance = questions.map((q, index) => ({
            question: q.question,
            userAnswer: answers[index] ?? "Not Answered",
            correctAnswer: q.correctAnswer,
            isCorrect: answers[index] === q.correctAnswer,
        }));

        const feedbackResult = await generateMcqFeedback({
            examType: form.getValues('examType'),
            subject: form.getValues('subject'),
            topic: form.getValues('topic'),
            performance: quizPerformance,
        });

        setAiFeedback(feedbackResult.feedback);
    } catch (error) {
        console.error("Error generating feedback:", error);
        setAiFeedback("Sorry, an error occurred while generating feedback. You can still review your answers and explanations.");
    } finally {
        setIsFeedbackLoading(false);
    }
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

  const getScoreFeedback = () => {
    if (scorePercentage > 70) {
      return { 
          emoji: '🎉', 
          message: "Mogambo khush hua!",
          taunt: "Mummy: Aaj kuch zyada hi intelligent lag raha hai tu!",
          cardClass: "bg-green-500/10 border-green-500"
        };
    }
    if (scorePercentage >= 40) {
      return { 
          emoji: '🤔', 
          message: "Pushpa... I hate tears 😭",
          taunt: "Bas thoda aur practice... warna mains mein 'bye' ho jayega!",
          cardClass: "bg-yellow-500/10 border-yellow-500"
        };
    }
    return { 
        emoji: '😒', 
        message: "Tera toh kuch nahi ho sakta, beta.",
        taunt: "Padhai se zyada toh tu reels scroll karta hai!",
        cardClass: "bg-destructive/10 border-destructive"
    };
  };

  const handleShare = () => {
    if (!questions) return;
    const feedback = getScoreFeedback();
    const text = `I just scored ${score}/${questions.length} on my ${form.getValues('examType')} practice quiz! ${feedback.message} - Check out A2G Smart Notes!`;
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to Clipboard!",
        description: "Your score and a link to the app have been copied. Share it with your friends!",
    });
  }

  const renderAiResult = (content: string | null) => {
    if (!content) return null;
    const htmlContent = marked.parse(content);
    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };


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
                <Card className={getScoreFeedback().cardClass}>
                    <CardHeader className="text-center">
                        <div className="text-6xl mb-4">{getScoreFeedback().emoji}</div>
                        <CardTitle className="font-headline text-3xl">{getScoreFeedback().message}</CardTitle>
                        <CardDescription className="text-base">{getScoreFeedback().taunt}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-lg text-muted-foreground mt-2">You scored</p>
                        <p className="text-6xl font-bold text-foreground my-2">{score} / {questions.length}</p>
                        <Progress value={scorePercentage} className="h-3 my-4 bg-background/50" />
                        <p className="font-semibold">{scorePercentage.toFixed(0)}% Correct</p>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 gap-2">
                        <Button onClick={() => resetQuiz(true)} variant="outline" className="w-full">
                            <RefreshCcw className="mr-2 h-4 w-4"/>
                            Retry Quiz
                        </Button>
                         <Button onClick={handleShare} variant="outline" className="w-full">
                            <Share2 className="mr-2 h-4 w-4"/>
                            Share Score
                        </Button>
                    </CardFooter>
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
                    {q.shuffledOptions.map((option, optIndex) => {
                       const isCorrect = option === q.correctAnswer;
                       const isUserChoice = answers[index] === option;
                      return (
                      <FormItem key={optIndex} className={`flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors ${ isSubmitted && isCorrect ? 'border-green-500 bg-green-500/10' : isSubmitted && isUserChoice && !isCorrect ? 'border-destructive bg-destructive/10' : 'border-border' }`}>
                        <FormControl><RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} /></FormControl>
                        <FormLabel htmlFor={`q${index}-opt${optIndex}`} className="font-normal flex-1 cursor-pointer">
                          {option}
                        </FormLabel>
                        {isSubmitted && (
                            <>
                            {isCorrect && <Check className="h-5 w-5 text-green-500" />}
                            {isUserChoice && !isCorrect && <X className="h-5 w-5 text-destructive" />}
                            </>
                        )}
                      </FormItem>
                    )})}
                  </RadioGroup>
                </CardContent>
                {isSubmitted && (
                    <CardFooter>
                       <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="explanation" className="border-t border-b-0">
                            <AccordionTrigger className="hover:no-underline">
                               <span className="flex items-center gap-2 text-primary hover:text-primary/80"><BookCheck className="h-4 w-4"/> View Explanation</span>
                            </AccordionTrigger>
                            <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pt-2 text-muted-foreground">
                                <p>{q.explanation}</p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    </CardFooter>
                )}
              </Card>
            ))}

            {!isSubmitted && (
                <Button onClick={handleSubmitQuiz} className="w-full" size="lg" disabled={!questions || answers.every(a => a === null)}>
                   {answers.some(a => a === null) && !answers.every(a => a === null) && <AlertCircle className="mr-2 h-4 w-4"/>}
                   Submit Quiz & View Results
                </Button>
            )}

            {isSubmitted && (
                <Card className="bg-primary/5 border-primary/20">
                     <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2 text-primary">
                           <Lightbulb/> AI Feedback & Next Steps
                        </CardTitle>
                        <CardDescription>
                            Here are some personalized tips from your AI tutor to help you improve.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isFeedbackLoading && (
                            <div className="flex items-center justify-center min-h-[100px]">
                                <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                                <p className="ml-4 text-muted-foreground">Analyzing your performance...</p>
                            </div>
                        )}
                        {!isFeedbackLoading && aiFeedback && (
                            <div className="p-4 bg-background rounded-lg border">
                                {renderAiResult(aiFeedback)}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="grid sm:grid-cols-2 gap-2">
                         <Button onClick={regenerateQuiz} variant="outline" className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Regenerate Quiz
                        </Button>
                         <Button onClick={practiceAnotherTopic} className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Practice Another Topic
                        </Button>
                    </CardFooter>
                </Card>
            )}
            </FormProvider>
          )}
        </div>
      </div>
    </div>
  );
}
