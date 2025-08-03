
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/ai/flows/generate-quiz';
import type { GenerateQuizOutput, GenerateQuizInput } from '@/app/dashboard/ai-quiz-generator/page';
import { FileQuestion, Loader2 } from 'lucide-react';
import { z } from 'zod';

const GenerateQuizInputSchema = z.object({
  targetExam: z.string({ required_error: 'Please select an exam.' }),
  subject: z.string().min(2, 'Subject must be at least 2 characters.'),
  topic: z.string().optional(),
  numQuestions: z.number().min(5).max(20),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
});

interface QuizGeneratorSetupProps {
  onQuizGenerated: (data: GenerateQuizOutput, config: GenerateQuizInput) => void;
}

export function QuizGeneratorSetup({ onQuizGenerated }: QuizGeneratorSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateQuizInput>({
    resolver: zodResolver(GenerateQuizInputSchema),
    defaultValues: {
      targetExam: 'GPAT',
      subject: '',
      topic: '',
      numQuestions: 10,
      difficulty: 'Medium',
    },
  });

  const numQuestions = form.watch('numQuestions');

  async function onSubmit(values: GenerateQuizInput) {
    setIsLoading(true);
    try {
      const response = await generateQuiz(values);
      if (response && response.questions.length > 0) {
        onQuizGenerated(response, values);
      } else {
         toast({
          variant: 'destructive',
          title: 'Quiz Generation Failed',
          description: 'The AI could not generate a quiz for the given inputs. Please try a different topic.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Quiz',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Quiz Configuration</CardTitle>
          <CardDescription>Set up your practice quiz session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="targetExam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Exam</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select an exam" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GPAT">GPAT</SelectItem>
                        <SelectItem value="NIPER">NIPER</SelectItem>
                        <SelectItem value="Drug Inspector">Drug Inspector</SelectItem>
                        <SelectItem value="Pharmacist Exam">Pharmacist Exam</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
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
                    <FormLabel>Topic (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Diuretics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions: {numQuestions}</FormLabel>
                    <FormControl>
                      <Slider
                        min={5}
                        max={20}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <p className="text-sm text-center text-muted-foreground">🟢 20/20 free questions remaining today.</p>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Quiz...</>
                ) : (
                  <><FileQuestion className="mr-2 h-4 w-4" />Generate Quiz</>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card className="shadow-md hidden lg:flex items-center justify-center">
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <FileQuestion className="h-16 w-16 mb-4" />
            <h3 className="font-headline text-lg font-semibold">Your Quiz Awaits</h3>
            <p className="text-sm">Configure your quiz settings in the panel to the left and start practicing for your exams.</p>
        </div>
      </Card>
    </div>
  );
}
