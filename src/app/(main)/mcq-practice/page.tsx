
'use client';
import { useState, useMemo, useEffect } from 'react';
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
import { CheckSquare, Loader2, Target, BrainCircuit, Check, X, BookCheck, AlertCircle, RefreshCcw, Share2, PlusCircle, Lightbulb, RefreshCw, Gem, ArrowRight, ShoppingCart, History } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { marked } from 'marked';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';
import { PaymentDialog } from '@/components/payment-dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


const mcqFormSchema = z.object({
  examType: z.string().min(1, 'Exam type is required'),
  otherExamType: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  numberOfQuestions: z.number().min(5).max(20),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
}).refine(data => {
    if (data.examType === 'Other') {
        return !!data.otherExamType && data.otherExamType.trim().length > 0;
    }
    return true;
}, {
    message: 'Please specify the exam name',
    path: ['otherExamType'],
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

const scoreFeedbacks = {
    bad: [
        { emoji: '😒', message: "Tera toh kuch nahi ho sakta, beta.", taunt: "Padhai se zyada toh tu reels scroll karta hai!" },
        { emoji: '🤦‍♂️', message: "Ye performance dekh ke... ", taunt: "Mera sir dukhne laga hai. Jaake thoda padh le!" },
        { emoji: '🥺', message: "Itna galat kaise ho sakta hai?", taunt: "Lagta hai 'options' aur 'sapne' dono galat choose kar rahe ho." },
    ],
    medium: [
        { emoji: '🤔', message: "Pushpa... I hate tears 😭", taunt: "Bas thoda aur practice... warna mains mein 'bye' ho jayega!" },
        { emoji: '😅', message: "Thoda aur zor lagao!", taunt: "Abhi 'borderline' pe ho, 'topper' banne ke liye thoda aur grind karna padega." },
        { emoji: '😬', message: "Not bad, but not great either.", taunt: "Currently in the 'Sharmaji ka beta can still beat you' zone." },
    ],
    good: [
        { emoji: '🎉', message: "Mogambo khush hua!", taunt: "Mummy: Aaj kuch zyada hi intelligent lag raha hai tu!" },
        { emoji: '😎', message: "Kya baat hai! Cha gaye guru!", taunt: "Keep it up! The only thing you're testing positive for is success." },
        { emoji: '🥳', message: "Excellent! You nailed it!", taunt: "Your brain cells are clearly working overtime. Nice!" },
    ]
};

const premiumFeatures = [
    "Unlimited MCQ practice questions",
    "Access to ALL premium library notes",
    "AI Note & Exam Question Generation",
    "Ask follow-up questions to our AI Tutor",
];

type PurchaseDetails = {
    title: string;
    price: string;
    questions: number;
}

const getRandomFeedback = (feedbacks: typeof scoreFeedbacks.good) => {
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
};


export default function McqPracticePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [questions, setQuestions] = useState<ShuffledQuestion[] | null>(null);
  const [answers, setAnswers] = useState<AnswersState>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const { toast } = useToast();
  
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PurchaseDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [dailyQuestionCount, setDailyQuestionCount] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(30);

  useEffect(() => {
    try {
        const storedData = localStorage.getItem('mcqUsage');
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        if (storedData) {
            const { date, count, limit } = JSON.parse(storedData);
            if (date === today) {
                setDailyQuestionCount(count);
                setDailyLimit(limit || 30);
            } else {
                // It's a new day, reset the counter
                localStorage.setItem('mcqUsage', JSON.stringify({ date: today, count: 0, limit: 30 }));
                setDailyQuestionCount(0);
                setDailyLimit(30);
            }
        } else {
            // No data stored, initialize for today
            localStorage.setItem('mcqUsage', JSON.stringify({ date: today, count: 0, limit: 30 }));
        }
    } catch (e) {
        console.warn("Could not access localStorage for daily quiz limit. Usage tracking will be session-based.");
    }
  }, []);

  const updateDailyUsage = (newQuestions: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newTotalCount = dailyQuestionCount + newQuestions;
    try {
        localStorage.setItem('mcqUsage', JSON.stringify({ date: today, count: newTotalCount, limit: dailyLimit }));
        setDailyQuestionCount(newTotalCount);
    } catch (e) {
        console.warn("Could not access localStorage for daily quiz limit.");
        setDailyQuestionCount(newTotalCount);
    }
  };


  const questionsLeft = Math.max(0, dailyLimit - dailyQuestionCount);
  const usageProgress = (dailyQuestionCount / dailyLimit) * 100;

  const form = useForm<McqFormValues>({
    resolver: zodResolver(mcqFormSchema),
    defaultValues: {
      examType: 'GPAT',
      subject: '',
      topic: '',
      otherExamType: '',
      numberOfQuestions: 10,
      difficulty: 'Medium',
    },
  });

  const watchExamType = form.watch('examType');

  const resetQuiz = (showToast = false) => {
    setIsSubmitted(false);
    setAiFeedback(null);
    setAnswers(new Array(questions?.length || 0).fill(null));
    if (showToast) {
        toast({ title: "Quiz Reset!", description: "You can now attempt the quiz again." });
    }
  }

  const startNewQuiz = () => {
    setQuestions(null);
    setIsSubmitted(false);
    setAnswers([]);
    setAiFeedback(null);
    setError(null);
    form.reset({
      examType: 'GPAT',
      subject: '',
      topic: '',
      otherExamType: '',
      numberOfQuestions: 10,
      difficulty: 'Medium',
    });
  }
  
  const handleQuizGeneration = async (data: McqFormValues) => {
    const questionsToGenerate = data.numberOfQuestions;
    if ((dailyQuestionCount + questionsToGenerate) > dailyLimit) {
        setShowPremiumDialog(true);
        return;
    }

    setIsLoading(true);
    setQuestions(null);
    setIsSubmitted(false);
    setAnswers([]);
    setAiFeedback(null);
    setError(null);
    
    const requestData = {
        ...data,
        examType: data.examType === 'Other' ? data.otherExamType! : data.examType,
    };

    try {
      const result = await generateMcqPractice(requestData);
      const shuffledResult = result.map(q => ({
        ...q,
        shuffledOptions: shuffleArray([...q.options]),
      }));
      setQuestions(shuffledResult);
      setAnswers(new Array(result.length).fill(null));
      updateDailyUsage(result.length);
    } catch (e: any) {
      console.error('Error generating MCQs:', e);
      const errorMessage = e.message.includes('503') 
        ? 'The AI model is currently overloaded. Please try again in a few moments.'
        : 'Failed to generate the quiz. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  
  const practiceSameTopic = () => {
    handleQuizGeneration(form.getValues());
  }
  
  const handleAnswerChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    setSubmissionCount(prev => prev + 1);
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
        
        const currentFormValues = form.getValues();

        const feedbackResult = await generateMcqFeedback({
            examType: currentFormValues.examType === 'Other' ? currentFormValues.otherExamType! : currentFormValues.examType,
            subject: currentFormValues.subject,
            topic: currentFormValues.topic ?? '',
            performance: quizPerformance,
        });

        setAiFeedback(feedbackResult.feedback);
    } catch (error: any) {
        console.error("Error generating feedback:", error);
        const errorMessage = error.message.includes('503')
          ? 'The AI model is currently overloaded, so feedback could not be generated. You can still review your answers.'
          : "Sorry, an error occurred while generating feedback. You can still review your answers and explanations.";
        setAiFeedback(`<div class="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">${errorMessage}</div>`);
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

  const getResultColorClass = (isCorrect: boolean, isUserChoice: boolean) => {
     if (isCorrect) return 'border-green-500 bg-green-500/20';
     if (isUserChoice && !isCorrect) return 'border-destructive bg-destructive/20';
     return 'border-border';
  }

  const scoreFeedback = useMemo(() => {
    if (!isSubmitted) return null;
    if (scorePercentage > 70) {
      return { ...getRandomFeedback(scoreFeedbacks.good), cardClass: "bg-green-500/10 border-green-500" };
    }
    if (scorePercentage >= 40) {
      return { ...getRandomFeedback(scoreFeedbacks.medium), cardClass: "bg-yellow-500/10 border-yellow-500" };
    }
    return { ...getRandomFeedback(scoreFeedbacks.bad), cardClass: "bg-destructive/10 border-destructive" };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scorePercentage, isSubmitted, submissionCount]);


  const handleShare = () => {
    if (!questions || !scoreFeedback) return;
    const currentFormValues = form.getValues();
    const examName = currentFormValues.examType === 'Other' ? currentFormValues.otherExamType : currentFormValues.examType;

    const text = `I just scored ${score}/${questions.length} on my ${examName} practice quiz! ${scoreFeedback.message} - Check out A2G Smart Notes!`;
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to Clipboard!",
        description: "Your score and a link to the app have been copied. Share it with your friends!",
    });
  }
  
  const handleBuyNow = (details: PurchaseDetails) => {
    setPaymentDetails(details);
    setShowPremiumDialog(false);
    setShowPaymentDialog(true);
  };

  const renderAiResult = (content: string | null) => {
    if (!content) return null;
    const htmlContent = marked.parse(content);
    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };


  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 lg:sticky top-20">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Target className="text-primary"/> MCQ Practice Generator</CardTitle>
            <CardDescription>Generate high-standard MCQs for competitive exams like GPAT, NIPER, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleQuizGeneration)} className="space-y-4">
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
                        <SelectItem value="Other">Other</SelectItem>
                       </SelectContent>
                    </Select>
                  </FormItem>
                )}/>
                {watchExamType === 'Other' && (
                  <FormField control={form.control} name="otherExamType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specify Exam Name</FormLabel>
                      <FormControl><Input placeholder="e.g., UPPSC Pharmacist" {...field} disabled={isLoading}/></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Pharmacology" {...field} disabled={isLoading}/></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="topic" render={({ field }) => (
                  <FormItem><FormLabel>Topic (Optional)</FormLabel><FormControl><Input placeholder="e.g., Diuretics" {...field} disabled={isLoading}/></FormControl><FormMessage /></FormItem>
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
            </FormProvider>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-4 border-t">
              <div className="w-full text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                      {questionsLeft > 0 ? `${questionsLeft} of ${dailyLimit} free questions left today.` : "You've used all your free questions for today."}
                  </p>
                  <Progress value={usageProgress} className="h-2 mt-2" />
              </div>
              <Button asChild variant="outline" className="w-full mt-2" onClick={() => setShowPremiumDialog(true)}>
                 <div><Gem className="mr-2 h-4 w-4"/> Upgrade for More</div>
              </Button>
          </CardFooter>
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
          {error && !isLoading && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Generating Quiz</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
          )}
          {!questions && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center h-96 text-center text-muted-foreground/50 border-2 border-dashed rounded-lg">
                  <BrainCircuit className="h-16 w-16 mb-4" />
                  <h3 className="text-xl font-semibold">Your Smart Quiz Awaits</h3>
                  <p className="mt-2 max-w-sm">Fill out the form to generate a set of targeted MCQs. You get {dailyLimit} free questions per day.</p>
              </div>
          )}

          {questions && (
            <FormProvider {...form}>
            {isSubmitted && scoreFeedback && (
                <Card className={scoreFeedback.cardClass}>
                    <CardHeader className="text-center">
                        <div className="text-6xl mb-4">{scoreFeedback.emoji}</div>
                        <CardTitle className="font-headline text-3xl">{scoreFeedback.message}</CardTitle>
                        <CardDescription className="text-base">{scoreFeedback.taunt}</CardDescription>
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
              <Card key={index} className={isSubmitted ? 'border-2' : ''} style={{ borderColor: isSubmitted && answers[index] === q.correctAnswer ? 'hsl(var(--primary))' : isSubmitted ? 'hsl(var(--border))' : 'transparent' }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>Question {index + 1}</CardTitle>
                    {isSubmitted && getResultIcon(answers[index] === q.correctAnswer)}
                  </div>
                  <CardDescription className="pt-2 text-base text-foreground">{q.question}</CardDescription>
                   {q.previouslyAsked && (
                     <Badge variant="secondary" className="mt-2 self-start">
                        <History className="mr-2 h-3 w-3" />
                        Previously Asked In: {q.previouslyAsked}
                     </Badge>
                   )}
                </CardHeader>
                <CardContent>
                  <RadioGroup value={answers[index] || ''} onValueChange={(val) => handleAnswerChange(index, val)} disabled={isSubmitted}>
                    {q.shuffledOptions.map((option, optIndex) => {
                       const isCorrect = option === q.correctAnswer;
                       const isUserChoice = answers[index] === option;
                      return (
                      <FormItem key={optIndex} className={`flex items-center space-x-3 space-y-0 p-3 rounded-md border transition-colors ${ isSubmitted ? getResultColorClass(isCorrect, isUserChoice) : 'border-border' }`}>
                        <FormControl><RadioGroupItem value={option} id={`q${index}-opt${optIndex}`} /></FormControl>
                        <FormLabel htmlFor={`q${index}-opt${optIndex}`} className="font-normal flex-1 cursor-pointer">
                          {option}
                        </FormLabel>
                        {isSubmitted && (
                            <>
                            {isCorrect && <span role="img" aria-label="Correct">✅</span>}
                            {isUserChoice && !isCorrect && <span role="img" aria-label="Incorrect">❌</span>}
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
                <Button onClick={handleSubmitQuiz} className="w-full" size="lg">
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
                         <Button onClick={startNewQuiz} variant="outline" className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Start New Quiz
                        </Button>
                         <Button onClick={practiceSameTopic} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Practice Same Topic
                        </Button>
                    </CardFooter>
                </Card>
            )}
            </FormProvider>
          )}
        </div>
      </div>
    </div>
    
    <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Gem className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-center font-headline text-2xl">Get More Questions</DialogTitle>
                <DialogDescription className="text-center text-base">
                   You've used all your {dailyLimit} free practice questions for today. Upgrade for more.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <Button asChild size="lg" className="w-full">
                    <Link href="/premium">Upgrade to Full Premium <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>

                <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-background px-2 text-sm text-muted-foreground">OR</span>
                </div>

                <p className="font-semibold text-center">Buy a Question Pack</p>
                
                <div className="grid grid-cols-1 gap-2">
                    <Button size="lg" variant="outline" onClick={() => handleBuyNow({title: '100 MCQs', price: '₹5', questions: 100})}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy 100 MCQs for ₹5
                    </Button>
                     <Button size="lg" variant="outline" onClick={() => handleBuyNow({title: '200 MCQs', price: '₹10', questions: 200})}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy 200 MCQs for ₹10
                    </Button>
                     <Button size="lg" variant="outline" onClick={() => handleBuyNow({title: '400 MCQs', price: '₹15', questions: 400})}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy 400 MCQs for ₹15
                    </Button>
                </div>

            </div>
        </DialogContent>
    </Dialog>

    <PaymentDialog 
        isOpen={showPaymentDialog} 
        setIsOpen={setShowPaymentDialog}
        title={`Buy ${paymentDetails?.title}`}
        price={paymentDetails?.price || ''}
        onPaymentSuccess={() => {
            // This is now just a callback for after the user has been notified.
            // No automatic upgrade happens here.
            setPaymentDetails(null);
        }}
    />
    </>
  );
}

    
