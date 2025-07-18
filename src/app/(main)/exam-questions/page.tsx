
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateExamQuestions, type GenerateExamQuestionsOutput } from '@/ai/flows/generate-exam-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NotebookPen, Loader2, Gem, ArrowRight, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Link from 'next/link';

const examQuestionsFormSchema = z.object({
  course: z.string().min(1, 'Course is required'),
  year: z.string().min(1, 'Year is required'),
  topic: z.string().min(1, 'Topic/Subject is required'),
  universityOrSyllabus: z.string().min(1, 'University/Syllabus is required'),
});

type ExamQuestionsFormValues = z.infer<typeof examQuestionsFormSchema>;

const premiumFeatures = [
    "Generate multiple unique question sets",
    "Create full-length AI mock tests",
    "Detailed performance analysis (coming soon)",
    "Access to ALL premium library notes",
];

export default function ExamQuestionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<GenerateExamQuestionsOutput | null>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  const form = useForm<ExamQuestionsFormValues>({
    resolver: zodResolver(examQuestionsFormSchema),
    defaultValues: {
      course: 'B.Pharm',
      year: '1st Year',
      topic: '',
      universityOrSyllabus: 'PCI',
    },
  });

  async function onSubmit(data: ExamQuestionsFormValues) {
    setIsLoading(true);
    setQuestions(null);
    try {
      const result = await generateExamQuestions(data);
      setQuestions(result);
    } catch (error) {
      console.error('Error generating exam questions:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const getBadgeVariant = (chance: 'High' | 'Medium' | 'Low'): 'destructive' | 'default' | 'secondary' => {
    switch (chance) {
        case 'High': return 'destructive';
        case 'Medium': return 'default';
        case 'Low': return 'secondary';
        default: return 'default';
    }
  }

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><NotebookPen className="text-primary"/> AI Exam Question Generator</CardTitle>
            <CardDescription>Generate high-probability exam questions based on the latest syllabus and past papers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="course" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <FormControl><Input placeholder="e.g., B.Pharm" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl><Input placeholder="e.g., 2nd Year" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="topic" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic/Subject</FormLabel>
                    <FormControl><Input placeholder="e.g., Physical Pharmaceutics" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="universityOrSyllabus" render={({ field }) => (
                  <FormItem>
                    <FormLabel>University/Syllabus</FormLabel>
                    <FormControl><Input placeholder="e.g., PCI or University Name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Questions
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Generated Questions</CardTitle>
            <CardDescription>Potential exam questions based on your input.</CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[60vh] w-full pr-4">
               {isLoading && (
                  <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4 text-muted-foreground">Analyzing patterns and generating questions...</p>
                  </div>
              )}
              {!questions && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                      <NotebookPen className="h-16 w-16 text-muted-foreground/30" />
                      <p className="mt-4 text-muted-foreground">Your generated questions will appear here.</p>
                  </div>
              )}
              {questions && (
                  <div className="space-y-6">
                      {questions.map((q, index) => (
                          <div key={index} className="p-4 border rounded-lg bg-card">
                              <p className="font-semibold text-lg"><span className="font-bold">Q{index + 1}.</span> {q.question}</p>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                                  <div>
                                      <strong>Expected Chance:</strong> <Badge variant={getBadgeVariant(q.expectedChance)}>{q.expectedChance}</Badge>
                                  </div>
                                  <div><strong>Frequency:</strong> <Badge variant="outline">{q.frequency}</Badge></div>
                                  <div><strong>Previously Asked:</strong> <Badge variant="outline">{q.previousYearsAsked}</Badge></div>
                              </div>
                          </div>
                      ))}

                        <Card className="mt-8 bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2 text-primary">
                                    <Gem />
                                    Take Your Preparation to the Next Level
                                </CardTitle>
                                <CardDescription>
                                    Unlock premium features to supercharge your exam readiness.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button size="lg" onClick={() => setShowPremiumDialog(true)}>
                                    <Gem className="mr-2 h-4 w-4" />
                                    Generate 3 More Question Sets
                                </Button>
                                <Button size="lg" variant="outline" onClick={() => setShowPremiumDialog(true)}>
                                    <Gem className="mr-2 h-4 w-4" />
                                    Generate AI Mock Test
                                </Button>
                            </CardContent>
                        </Card>
                  </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
    <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Gem className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-center font-headline text-2xl">Upgrade to Unlock More Power</DialogTitle>
                <DialogDescription className="text-center text-base">
                   This is a premium feature. Upgrade your plan to get instant access.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="font-semibold mb-3">Premium exam tools include:</p>
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
