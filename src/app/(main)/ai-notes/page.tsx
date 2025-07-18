
'use client';
import { useState, useMemo } from 'react';
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
import { BrainCircuit, Loader2, Send, User, Bot, Lock, Sparkles, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notesData } from '@/lib/notes-data';
import { marked } from 'marked';

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

export default function AiNotesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowupLoading, setIsFollowupLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [followUp, setFollowUp] = useState('');
  const [lastTopic, setLastTopic] = useState<NotesFormValues | null>(null);

  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesFormSchema),
    defaultValues: {
      course: 'B.Pharm',
      year: '1st Year',
      subject: '',
      topic: '',
    },
  });

  const relatedNotes = useMemo(() => {
    if (!lastTopic || !lastTopic.subject) return [];
    return notesData
      .filter(note => 
          note.isPremium &&
          note.subject.toLowerCase().includes(lastTopic.subject.toLowerCase())
      )
      .slice(0, 2);
  }, [lastTopic]);
  

  async function onSubmit(data: NotesFormValues) {
    setIsLoading(true);
    setGeneratedNotes(null);
    setChatHistory([]);
    setLastTopic(data);
    try {
      const result = await generateNotesFromTopic(data);
      const assistantMessage = { role: 'assistant', content: result.notes };
      setGeneratedNotes(result.notes);
      setChatHistory([assistantMessage]);
    } catch (error: any) {
      console.error('Error generating notes:', error);
       const errorMessage = error.message.includes('503') 
        ? 'The AI model is currently overloaded. Please try again in a few moments.'
        : 'Sorry, an error occurred while generating notes. Please try again.';
      setChatHistory([{ role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFollowUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!followUp.trim() || !generatedNotes) return;

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
    } catch (error: any) {
      console.error('Error with follow-up:', error);
      const errorMessage = error.message.includes('503')
        ? 'The AI model is currently overloaded. Please try again in a few moments.'
        : 'Sorry, I encountered an error. Please try again.';
      const errorAnswer: ChatMessage = { role: 'assistant', content: errorMessage };
      setChatHistory(prev => [...prev, errorAnswer]);
    } finally {
      setIsFollowupLoading(false);
    }
  }
  
  const renderMessageContent = (content: string) => {
    const htmlContent = marked.parse(content);
    return <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
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
                        Found these notes helpful? Unlock our detailed, expert-written premium notes on related topics to boost your study.
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
                                <Button asChild className="w-full">
                                  <a href={`/notes`}>
                                      <Lock className="mr-2 h-4 w-4"/>
                                      Unlock in Library
                                  </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        )}
      </div>
      <div className="lg:col-span-2">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="font-headline">Generated Content</CardTitle>
            <CardDescription>Your AI-generated notes and conversation will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             <ScrollArea className="h-[70vh] lg:h-[calc(100vh-320px)] w-full pr-4">
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
                     <div className={`p-4 rounded-lg flex-1 ${msg.role === 'user' ? 'bg-muted' : 'bg-background border'}`}>
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
          </CardContent>
          {generatedNotes && (
            <CardFooter>
              <form onSubmit={handleFollowUpSubmit} className="w-full flex items-center gap-2 pt-4 border-t">
                  <Input 
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                      placeholder="Ask a follow-up question..."
                      disabled={isFollowupLoading}
                  />
                  <Button type="submit" size="icon" disabled={isFollowupLoading || !followUp.trim()}>
                      {isFollowupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
              </form>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
