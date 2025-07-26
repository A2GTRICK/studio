
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
import { BrainCircuit, Loader2, Send, User, Bot, Lock, Sparkles, BookOpen, AlertCircle, Expand, Printer, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { marked } from 'marked';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNotes, type Note } from '@/context/notes-context';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const printableContentRef = useRef<HTMLDivElement>(null);

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
    setIsLoading(true);
    setGeneratedNotes(null);
    setChatHistory([]);
    setError(null);
    setLastTopic(data);
    try {
      const result = await generateNotesFromTopic(data);
      const assistantMessage = { role: 'assistant', content: result.notes };
      setGeneratedNotes(result.notes);
      setChatHistory([assistantMessage]);
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
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = printableContentRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const ratio = canvasWidth / canvasHeight;
    
    const imgHeight = pdfWidth / ratio;
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    const safeTopic = lastTopic?.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'notes';
    pdf.save(`${safeTopic}.pdf`);
  };


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 lg:sticky top-20 print-hide">
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
          </Card>
           {generatedNotes && relatedNotes.length > 0 && (
              <Card className="mt-8 bg-primary/5 border-primary/20">
                  <CardHeader>
                      <CardTitle className="font-headline flex items-center gap-2 text-primary text-lg">
                          <BookOpen/>
                          Continue Your Learning
                      </CardTitle>
                      <CardDescription>
                          Unlock our expert-written premium notes on related topics.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4">
                      {relatedNotes.map(note => (
                          <Card key={note.id} className="bg-background">
                              <CardHeader>
                                  <CardTitle className="text-base">{note.title}</CardTitle>
                                  <CardDescription>{note.subject}</CardDescription>
                              </CardHeader>
                              <CardFooter>
                                  <Button asChild className="w-full" variant="outline">
                                    <Link href={`/notes/${note.id}`}>
                                        <Lock className="mr-2 h-4 w-4"/>
                                        Unlock in Library
                                    </Link>
                                  </Button>
                              </CardFooter>
                          </Card>
                      ))}
                  </CardContent>
              </Card>
          )}
        </div>
        <div className="lg:col-span-2 print-hide">
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
                <ScrollArea className="h-full w-full pr-4">
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
                      <p className="mt-2 max-w-sm">Fill out the form on the left to generate detailed notes on any topic from your syllabus.</p>
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
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
            {generatedNotes && (
              <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
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
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      <Dialog open={isExpandViewOpen} onOpenChange={setIsExpandViewOpen}>
        <DialogContent className="max-w-none w-[95vw] h-[95vh] flex flex-col print-dialog-content">
            <DialogHeader className="print-hide">
                <DialogTitle className="font-headline text-2xl">Expanded View</DialogTitle>
                <DialogDescription>
                    Topic: {lastTopic?.topic}
                </DialogDescription>
            </DialogHeader>
            <div className="flex-grow overflow-hidden flex flex-col">
                <ScrollArea className="flex-grow pr-6">
                    <div ref={printableContentRef} className="printable-content watermarked-content space-y-4 p-1">
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
                    </div>
                </ScrollArea>
            </div>
             <DialogFooter className="print-hide">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print with Watermark
                </Button>
                <Button onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Download as PDF
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    