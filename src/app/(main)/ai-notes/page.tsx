'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateNotesFromTopic } from '@/ai/flows/generate-notes-from-topic';
import { answerFollowUpQuestion } from '@/ai/flows/answer-follow-up-question';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, Loader2, Send, User, Bot, Lock, Sparkles, BookOpen, AlertCircle, Expand, Printer, Gem, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { marked } from 'marked';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNotes, type Note } from '@/context/notes-context';
import { handlePrint } from '@/lib/print-helper';
import { useUsageLimiter } from '@/hooks/use-usage-limiter';
import { PaymentDialog } from '@/components/payment-dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';

const notesFormSchema = z.object({
  course: z.string().min(1, 'Course is required'),
  year: z.string().min(1, 'Year is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
});

type NotesFormValues = z.infer<typeof notesFormSchema>;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const loadingMessages = [
    "AI aapke notes bana raha hai... ☕",
    "Digital textbooks se gyan le rahe hain...",
    "Secrets of pharmacology ko unlock kar rahe hain...",
    "Bas ek second, perfect explanation taiyar hai...",
    "Syllabus se cross-check kar rahe hain... ✅",
];

const followupFormSchema = z.object({
    question: z.string().min(1),
});
type FollowupFormValues = z.infer<typeof followupFormSchema>;

const premiumFeatures = [
    "Unlimited AI note generations",
    "Unlimited follow-up questions",
    "Access to ALL premium library notes",
    "Priority support and early access",
];

type PaymentDetails = {
    title: string;
    price: string;
}

export default function AiNotesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [lastTopic, setLastTopic] = useState<NotesFormValues | null>(null);
  const { notes: allNotes } = useNotes();
  const [error, setError] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  const [isExpandViewOpen, setIsExpandViewOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const printableContentRef = useRef<HTMLDivElement>(null);
  const { hasPremiumAccess } = useAuth();
  
  const [followUpCount, setFollowUpCount] = useState(0);

  const {
    count: dailyGenerations,
    limit: dailyGenerationLimit,
    increment: incrementGenerations,
    canUse: canGenerate,
  } = useUsageLimiter('aiNotesGenerations', 2, hasPremiumAccess);

  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [showPrintPremiumDialog, setShowPrintPremiumDialog] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentLoadingMessage(prev => {
            const nextIndex = (loadingMessages.indexOf(prev) + 1) % loadingMessages.length;
            return loadingMessages[nextIndex];
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatHistory, isFollowupLoading]);

  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesFormSchema),
    defaultValues: {
      course: 'B.Pharm',
      year: '1st Year',
      subject: '',
      topic: '',
    },
  });

  const followupForm = useForm<FollowupFormValues>({
    resolver: zodResolver(followupFormSchema),
    defaultValues: {
        question: "",
    },
  });

  const relatedNotes = useMemo(() => {
    if (!lastTopic || !lastTopic.subject || allNotes.length === 0) return [];
    return allNotes
      .filter(note => 
          note.isPremium &&
          note.subject.toLowerCase().includes(lastTopic.subject.toLowerCase())
      )
      .slice(0, 2);
  }, [lastTopic, allNotes]);
  

  async function onSubmit(data: NotesFormValues) {
    if (!canGenerate && !hasPremiumAccess) {
        setShowPremiumDialog(true);
        return;
    }

    setIsLoading(true);
    setGeneratedNotes(null);
    setChatHistory([]);
    setError(null);
    setLastTopic(data);
    setFollowUpCount(0); // Reset follow-up count for new note
    try {
      const result = await generateNotesFromTopic(data);
      const assistantMessage: ChatMessage = { role: 'assistant', content: result.notes };
      setGeneratedNotes(result.notes);
      setChatHistory([assistantMessage]);
      if (!hasPremiumAccess) {
          incrementGenerations();
      }
    } catch (e: any) {
      console.error('Error generating notes:', e);
       const errorMessage = e.message.includes('503') 
        ? 'The AI model is currently overloaded. Please try again in a few moments.'
        : 'Sorry, an error occurred while generating notes. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFollowUpSubmit(data: FollowupFormValues) {
    if (!data.question.trim() || !generatedNotes) return;

    if (followUpCount >= 3 && !hasPremiumAccess) {
        setShowPremiumDialog(true);
        return;
    }

    const newQuestion: ChatMessage = { role: 'user', content: data.question };
    setChatHistory(prev => [...prev, newQuestion]);
    setIsFollowupLoading(true);
    followupForm.reset();

    try {
      const result = await answerFollowUpQuestion({
        question: data.question,
        previousNotes: generatedNotes,
      });
      const newAnswer: ChatMessage = { role: 'assistant', content: result.answer };
      setChatHistory(prev => [...prev, newAnswer]);
      if (!hasPremiumAccess) {
          setFollowUpCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error with follow-up:', error);
      const errorMessage = error.message.includes('503')
        ? 'The AI model is currently overloaded. Please try again.'
        : 'Sorry, I encountered an error. Please try again.';
      const errorAnswer: ChatMessage = { role: 'assistant', content: errorMessage };
      setChatHistory(prev => [...prev, errorAnswer]);
    } finally {
      setIsFollowupLoading(false);
    }
  }

  const renderMessageContent = (content: string) => {
    const htmlContent = marked.parse(content);
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  const usageProgress = (dailyGenerations / dailyGenerationLimit) * 100;
  const followUpProgress = (followUpCount / 3) * 100;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky top-20">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary"/> AI Notes Generator</CardTitle>
              <CardDescription>Generate high-quality, detailed notes on any topic to kickstart your studies.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="course" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="B.Pharm">B.Pharm</SelectItem>
                          <SelectItem value="D.Pharm">D.Pharm</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                         <FormControl><SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger></FormControl>
                         <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                         </SelectContent>
                      </Select>
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl><Input placeholder="e.g., Pharmaceutics" {...field} disabled={isLoading}/></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="topic" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl><Textarea placeholder="e.g., Introduction to Dosage Forms" {...field} disabled={isLoading}/></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Notes
                  </Button>
                </form>
              </Form>
            </CardContent>
            {!hasPremiumAccess && (
                <CardFooter className="flex flex-col gap-2 pt-4 border-t">
                <div className="w-full text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                        {dailyGenerationLimit - dailyGenerations} of {dailyGenerationLimit} free note generations left today.
                    </p>
                    <Progress value={usageProgress} className="h-2 mt-2" />
                </div>
                <Button asChild variant="outline" className="w-full mt-2" onClick={() => setShowPremiumDialog(true)}>
                    <div><Gem className="mr-2 h-4 w-4"/> Upgrade for More</div>
                </Button>
                </CardFooter>
            )}
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-headline">Generated Content</CardTitle>
                <CardDescription>Your AI-generated notes and conversation will appear here.</CardDescription>
              </div>
              {chatHistory.length > 0 && (
                 <Button variant="ghost" size="icon" onClick={() => setIsExpandViewOpen(true)}>
                  <Expand className="h-5 w-5" />
                  <span className="sr-only">Expand View</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="h-[70vh] lg:h-[calc(100vh-320px)] w-full watermarked-content rounded-lg">
                <ScrollArea className="h-full w-full pr-4" viewportRef={scrollAreaRef}>
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4 text-muted-foreground animate-pulse">{currentLoadingMessage}</p>
                    </div>
                  )}
                  {!isLoading && error && (
                    <Alert variant="destructive" className="my-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Generation Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {chatHistory.length === 0 && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/50 border-2 border-dashed rounded-lg p-8">
                      <BrainCircuit className="h-16 w-16 mb-4" />
                      <h3 className="text-xl font-semibold">AI Notes Generator is Ready</h3>
                      <p className="mt-2 max-w-sm">Fill out the form on the left to generate detailed notes. You get {hasPremiumAccess ? 'unlimited' : dailyGenerationLimit} generations per day.</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'assistant' && (
                          <div className="p-2 rounded-full bg-primary text-primary-foreground self-start shrink-0">
                            <Bot className="h-5 w-5" />
                          </div>
                        )}
                        <div className={`p-4 rounded-lg flex-1 ${msg.role === 'user' ? 'bg-muted' : 'bg-background/80 border'}`}>
                          {renderMessageContent(msg.content)}
                        </div>
                        {msg.role === 'user' && (
                          <div className="p-2 rounded-full bg-muted self-start shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isFollowupLoading && (
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-primary text-primary-foreground self-start shrink-0">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="p-4 rounded-lg flex-1 bg-background/80 border flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                            </div>
                        </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
            {generatedNotes && (
              <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
                 <div className="w-full">
                    <FormProvider {...followupForm}>
                        <form onSubmit={followupForm.handleSubmit(handleFollowUpSubmit)} className="w-full flex items-center gap-2">
                            <div className="flex-grow space-y-2 w-full">
                                <label htmlFor="follow-up-input" className="text-sm font-medium text-foreground">Need more details? Ask the AI!</label>
                                <FormField
                                    control={followupForm.control}
                                    name="question"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    id="follow-up-input"
                                                    placeholder="Ask a follow-up question..."
                                                    disabled={isFollowupLoading}
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" size="icon" disabled={isFollowupLoading || !followupForm.formState.isValid} className="self-end mt-auto">
                                {isFollowupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </form>
                    </FormProvider>
                 </div>
                 {!hasPremiumAccess && (
                    <div className="w-full text-center pt-2">
                        <p className="text-xs font-medium text-muted-foreground">
                            {3 - followUpCount} of 3 free follow-ups left for this note.
                        </p>
                        <Progress value={followUpProgress} className="h-1 mt-1" />
                    </div>
                 )}
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={isExpandViewOpen} onOpenChange={setIsExpandViewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader className="print-hide">
                <DialogTitle className="font-headline text-2xl">Expanded View</DialogTitle>
                <DialogDescription>
                    Topic: {lastTopic?.topic}
                </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-6">
                    <div ref={printableContentRef} className="printable-content space-y-4 bg-background text-foreground p-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end print-hide' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="p-2 rounded-full bg-primary text-primary-foreground self-start shrink-0 print-hide">
                                <Bot className="h-5 w-5" />
                                </div>
                            )}
                            <div className={`p-4 rounded-lg flex-1 ${msg.role === 'user' ? 'bg-muted' : 'bg-background/80 border'}`}>
                                {renderMessageContent(msg.content)}
                            </div>
                            {msg.role === 'user' && (
                                <div className="p-2 rounded-full bg-muted self-start shrink-0 print-hide">
                                    <User className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            </div>
             <DialogFooter className="print-hide">
                <Button variant="outline" onClick={() => {
                    if (hasPremiumAccess) {
                        handlePrint(printableContentRef);
                    } else {
                        setShowPrintPremiumDialog(true);
                    }
                }}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save as PDF
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Gem className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-center font-headline text-2xl">Daily Limit Reached</DialogTitle>
                <DialogDescription className="text-center text-base">
                   You've used all your free AI generations or follow-ups for today. Please upgrade for unlimited access.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="font-semibold mb-3">Premium benefits include:</p>
                <ul className="space-y-3">
                    {premiumFeatures.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <Button asChild size="lg">
                    <Link href="/premium">Upgrade to Full Premium <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" onClick={() => {
                    setShowPremiumDialog(false);
                    setPaymentDetails({ title: "AI Notes Day Pass", price: "INR 29" });
                    setShowPaymentDialog(true);
                }}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy AI Notes Day Pass for INR 29
                </Button>
            </div>
        </DialogContent>
    </Dialog>
    
    <Dialog open={showPrintPremiumDialog} onOpenChange={setShowPrintPremiumDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Printer className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-center font-headline text-2xl">Unlock Printing</DialogTitle>
                <DialogDescription className="text-center text-base">
                   This is a premium feature. Choose how you want to unlock it.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="font-semibold mb-3">Premium benefits include:</p>
                 <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-muted-foreground">Unlimited Printing and PDF Downloads</span>
                    </li>
                    {premiumFeatures.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <Button asChild size="lg">
                    <Link href="/premium">Upgrade to Full Premium <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" onClick={() => {
                    setShowPrintPremiumDialog(false);
                    setPaymentDetails({ title: "Single Note Print/PDF", price: "INR 2" });
                    setShowPaymentDialog(true);
                }}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy One-Time Print for INR 2
                </Button>
            </div>
        </DialogContent>
    </Dialog>

    <PaymentDialog 
        isOpen={showPaymentDialog} 
        setIsOpen={setShowPaymentDialog}
        title={paymentDetails?.title || "Purchase"}
        price={paymentDetails?.price || ""}
    />
    </>
  );
}
