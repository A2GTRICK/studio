'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  summarizeDocument,
  type SummarizeDocumentOutput,
} from '@/ai/flows/summarize-document';
import { BookText, Loader2 } from 'lucide-react';

const formSchema = z.object({
  document: z
    .string()
    .min(100, { message: 'Document must be at least 100 characters long.' }),
});

export function DocumentSummarizerForm() {
  const [result, setResult] = useState<SummarizeDocumentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      document: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await summarizeDocument(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Summary',
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
          <CardTitle className="font-headline">Document</CardTitle>
          <CardDescription>
            Paste the document you want to summarize.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your document here..."
                        className="min-h-[300px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <BookText className="mr-2 h-4 w-4" />
                    Summarize Document
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Generated Summary</CardTitle>
          <CardDescription>
            Your AI-generated summary will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[450px] overflow-y-auto rounded-md border bg-secondary/30 p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="font-medium">Generating your summary...</p>
              <p className="text-sm">This may take a few moments.</p>
            </div>
          )}
          {result && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-body text-sm">
                {result.summary}
              </pre>
            </div>
          )}
          {!isLoading && !result && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <BookText className="h-10 w-10 mb-4" />
              <p>Your summary is waiting to be created.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
