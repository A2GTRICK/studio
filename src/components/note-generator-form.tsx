
'use client';

import { useState, useEffect } from 'react';
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
import { Bot, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const formSchema = z.object({
  course: z.string({ required_error: 'Please select a course.' }),
  otherCourse: z.string().optional(),
  year: z.string({ required_error: 'Please select a year.' }),
  subject: z.string().min(2, { message: 'Subject must be at least 2 characters.' }),
  topic: z.string().min(2, { message: 'Topic must be at least 2 characters.' }),
  universitySyllabus: z.string().optional(),
}).refine(data => {
    if (data.course === 'Other') {
        return !!data.otherCourse && data.otherCourse.length >= 2;
    }
    return true;
}, {
    message: 'Course name must be at least 2 characters.',
    path: ['otherCourse'],
});


const loadingMessages = [
    "Analyzing your topic...",
    "Consulting expert sources...",
    "Structuring the content...",
    "Formatting the notes...",
    "Finalizing the details...",
];

const courseYearMapping: Record<string, string[]> = {
    "B.Pharm": ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    "D.Pharm": ["1st Year", "2nd Year"],
    "MBBS": ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
    "BDS": ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    "Other": ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
};

export function NoteGeneratorForm() {
  const [generatedContent, setGeneratedContent] = useState<GenerateNotesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      topic: '',
      universitySyllabus: '',
      otherCourse: '',
    },
  });
  
  const selectedCourse = form.watch("course");

  useEffect(() => {
    if (selectedCourse) {
      setAvailableYears(courseYearMapping[selectedCourse] || []);
      form.resetField('year', { defaultValue: '' });
    } else {
      setAvailableYears([]);
    }
  }, [selectedCourse, form]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  async function onNoteSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setGeneratedContent(null);
    setLoadingMessage(loadingMessages[0]);
    
    const submissionValues = {
        ...values,
        course: values.course === 'Other' ? values.otherCourse! : values.course,
    };

    try {
      const response = await generateNotes(submissionValues);
      setGeneratedContent(response);
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
            <form onSubmit={form.handleSubmit(onNoteSubmit)} className="space-y-6">
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
                        <SelectItem value="MBBS">MBBS</SelectItem>
                        <SelectItem value="BDS">BDS</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedCourse === 'Other' && (
                 <FormField
                    control={form.control}
                    name="otherCourse"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Specify Course Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., B.Sc. Nursing" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              )}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCourse}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableYears.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
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
               <FormField
                control={form.control}
                name="universitySyllabus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University / Syllabus / Exam (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., GPAT, PCI Syllabus" {...field} />
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
        <CardContent className="h-[calc(100%-7rem)]">
          <div className="flex-grow overflow-y-auto rounded-md border bg-secondary/30 p-4 relative h-full">
             {isLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center h-full text-muted-foreground bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="font-medium">{loadingMessage}</p>
              </div>
            )}
            
            {generatedContent && (
              <div className="prose dark:prose-invert max-w-none">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedContent.notes}</ReactMarkdown>
              </div>
            )}

            {!isLoading && !generatedContent && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Bot className="h-10 w-10 mb-4" />
                <p className="font-semibold">Welcome to the AI Notes Generator!</p>
                <p className="text-sm">Fill out the form to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
