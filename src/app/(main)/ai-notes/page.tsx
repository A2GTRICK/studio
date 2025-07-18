
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateNotesFromTopic } from '@/ai/flows/generate-notes-from-topic';
import { answerFollowUpQuestion } from '@/ai/flows/answer-follow-up-question';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, Loader2, Send, User, Bot, Gem, Check, ArrowRight, Lock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';

const notesFormSchema = z.object({
  course: z.string().min(1, 'Course is required'),
  year: z.string().min(1, 'Year is required'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().min(1, 'Topic is required'),
  detailLevel: z.enum(['Standard', 'Detailed', 'Competitive Exam Focus']),
});

type NotesFormValues = z.infer<typeof notesFormSchema>;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const premiumFeatures = [
    "Unlimited AI Note Generation",
    "Generate questions for competitive exams",
    "Ask follow-up questions",
    "Access all premium library notes",
]

export default function AiNotesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState('');
  
  // --- MOCK STATE ---
  // In a real app, these would come from your auth/user state
  const [isPremiumUser, setIsPremiumUser] = useState(false); 
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);
  // ------------------

  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const hasUsedFreeGeneration = freeGenerationsUsed >= 1;

  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesFormSchema),
    defaultValues: {
      course: 'B.Pharm',
      year: '1st Year',
      subject: '',
      topic: '',
      detailLevel: 'Standard',
    },
  });
  
  const detailLevelValue = form.watch('detailLevel');

  async function onSubmit(data: NotesFormValues) {
    if (!isPremiumUser && (hasUsedFreeGeneration || data.detailLevel !== 'Standard')) {
        setShowPremiumDialog(true);
        return;
    }

    setIsLoading(true);
    setGeneratedNotes(null);
    setChatHistory([]);
    try {
      const result = await generateNotesFromTopic(data);
      setGeneratedNotes(result.notes);
      setChatHistory([{ role: 'assistant', content: result.notes }]);
      if (!isPremiumUser) {
          setFreeGenerationsUsed(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      setChatHistory([{ role: 'assistant', content: 'Sorry, an error occurred while generating notes. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFollowUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!followUp.trim() || !generatedNotes) return;

    if (!isPremiumUser) {
        setShowPremiumDialog(true);
        return;
    }

    const newQuestion: ChatMessage = { role: 'user', content: followUp };
    setChatHistory(prev => [...prev, newQuestion]);
    setIsFollowupLoading(true);
    const currentFollowUp = followUp;
    setFollowUp('');

    try {
      const result = await answerFollowUpQuestion({
        question: currentFollowUp,
        previousNotes: generatedNotes,
      });
      const newAnswer: ChatMessage = { role: 'assistant', content: result.answer };
      setChatHistory(prev => [...prev, newAnswer]);
    } catch (error) {
      console.error('Error with follow-up:', error);
      const errorAnswer: ChatMessage = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setChatHistory(prev => [...prev, errorAnswer]);
    } finally {
      setIsFollowupLoading(false);
    }
  }

  const isFormDisabled = isLoading || (!isPremiumUser && hasUsedFreeGeneration);

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit className="text-primary"/> AI Notes Generator</CardTitle>
            <CardDescription>Get one free standard note generation, or upgrade for unlimited use and premium features.</CardDescription>
          </CardHeader>
          <CardContent>
            {isFormDisabled && !isLoading ? (
                <Card className="bg-primary/10 border-primary text-center p-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-4">
                        <Gem className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-xl">You've Used Your Free Generation!</CardTitle>
                    <CardDescription className="mt-2 mb-4">Upgrade to Premium to unlock unlimited notes, detailed analysis, and the ability to ask follow-up questions.</CardDescription>
                    <Button onClick={() => setShowPremiumDialog(true)}>
                       Upgrade to Premium
                    </Button>
                </Card>
            ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="course" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
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
                    <FormControl><Input placeholder="e.g., Pharmaceutics" {...field} disabled={isFormDisabled}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="topic" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl><Textarea placeholder="e.g., Introduction to Dosage Forms" {...field} disabled={isFormDisabled}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="detailLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level of Detail</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFormDisabled}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select Detail Level" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard {isPremiumUser ? '' : '(1 Free Use)'}</SelectItem>
                        <SelectItem value="Detailed">
                            <div className="flex items-center gap-2">
                                {!isPremiumUser && <Lock className="h-3 w-3 text-muted-foreground"/>}
                                Detailed (Premium)
                            </div>
                        </SelectItem>
                        <SelectItem value="Competitive Exam Focus">
                            <div className="flex items-center gap-2">
                                {!isPremiumUser && <Lock className="h-3 w-3 text-muted-foreground"/>}
                                Competitive Exam Focus (Premium)
                            </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {!isPremiumUser && detailLevelValue !== 'Standard' && <FormMessage>This is a premium feature.</FormMessage>}
                  </FormItem>
                )}/>
                <Button type="submit" disabled={isFormDisabled} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isPremiumUser ? 'Generate Notes' : 'Generate Free Note'}
                </Button>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col max-h-[80vh]">
          <CardHeader>
            <CardTitle className="font-headline">Generated Content</CardTitle>
            <CardDescription>Your notes and conversation will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow min-h-0">
             <ScrollArea className="h-[calc(80vh-250px)] w-full pr-4">
              {isLoading && (
                  <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4 text-muted-foreground">Generating your notes...</p>
                  </div>
              )}
              {chatHistory.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                      <BrainCircuit className="h-16 w-16 text-muted-foreground/30" />
                      <p className="mt-4 text-muted-foreground">Fill out the form to generate your first set of notes.</p>
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
                     <div className={`prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg flex-1 ${msg.role === 'user' ? 'bg-muted' : 'bg-background'}`}>
                      <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/```/g, '') }} />
                    </div>
                     {msg.role === 'user' && (
                       <div className="p-2 rounded-full bg-muted self-start shrink-0">
                          <User className="h-5 w-5" />
                       </div>
                    )}
                  </div>
                ))}
              </div>
             </ScrollArea>
          </CardContent>
          {generatedNotes && (
            <CardFooter>
              <form onSubmit={handleFollowUpSubmit} className="w-full flex items-center gap-2">
                  <Input 
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                      placeholder={isPremiumUser ? "Ask a follow-up question..." : "Upgrade to Premium to ask follow-up questions"}
                      disabled={isFollowupLoading || !isPremiumUser}
                  />
                  <Button type="submit" size="icon" disabled={isFollowupLoading || !followUp.trim() || !isPremiumUser}>
                      {isFollowupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
              </form>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
    <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Gem className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-center font-headline text-2xl">Unlock Your Full Potential</DialogTitle>
                <DialogDescription className="text-center text-base">
                   This is a premium feature. Upgrade now to get instant access to our most powerful tools.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
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
                    <Link href="/premium">Upgrade to Premium <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="ghost" onClick={() => setShowPremiumDialog(false)}>Maybe Later</Button>
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
