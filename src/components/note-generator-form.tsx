
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateNotes, type GenerateNotesOutput } from '@/ai/flows/generate-notes';
import { Bot, Loader2, Send } from 'lucide-react';
import { Textarea } from './ui/textarea';

const formSchema = z.object({
  course: z.string({ required_error: 'Please select a course.' }),
  year: z.string({ required_error: 'Please select a year.' }),
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
});

export function NoteGeneratorForm() {
  const [result, setResult] = useState<GenerateNotesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      topic: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateNotes(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error Generating Notes",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="shadow-md lg:col-span-1">
        <CardHeader>
          <CardTitle className="font-headline">Control Panel</CardTitle>
          <CardDescription>Provide the context for your notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="B.Pharm">B.Pharm</SelectItem>
                        <SelectItem value="D.Pharm">D.Pharm</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pharmacology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Mechanism of action of diuretics" {...field} className="min-h-[100px] resize-y" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Generate Notes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md lg:col-span-2 h-full">
        <CardHeader>
          <CardTitle className="font-headline">Content Area</CardTitle>
          <CardDescription>Your AI-generated notes will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100%-7rem)]">
          <div className="flex-grow overflow-y-auto rounded-md border bg-secondary/30 p-4 relative">
             {isLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center h-full text-muted-foreground bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="font-medium">Synthesizing information...</p>
                <p className="text-sm">Consulting digital textbooks...</p>
              </div>
            )}
            {result && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-body text-sm">{result.notes}</pre>
              </div>
            )}
             {!isLoading && !result && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-10 w-10 mb-4" />
                <p className="font-semibold">Welcome to the AI Notes Generator!</p>
                <p className="text-sm">Fill out the form to get started.</p>
              </div>
            )}
          </div>
          {result && !isLoading && (
             <div className="mt-4 flex gap-2">
                <Input placeholder="Ask a follow-up question..." />
                <Button><Send className="h-4 w-4" /></Button>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
