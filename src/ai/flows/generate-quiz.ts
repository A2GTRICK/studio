
'use server';

/**
 * @fileOverview Generates a quiz from provided notes.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  notes: z.string().describe('The notes to generate a quiz from.'),
  subject: z.string().describe('The subject of the notes.'),
  topic: z.string().describe('The specific topic of the notes.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz in Markdown format.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz creator for pharmacy students. Your task is to generate a challenging multiple-choice quiz based on the provided study notes.

The user is studying the following:
- Subject: {{{subject}}}
- Topic: {{{topic}}}

Here are the notes to base the quiz on:
---
{{{notes}}}
---

Please generate a quiz with 10 multiple-choice questions. Each question must have four options (A, B, C, D).

The output must be in Markdown format. Structure it as follows:
1.  Start with a clear heading for the quiz.
2.  For each question, provide the question text followed by the four options.
3.  After all the questions, create a separate "Answer Key" section.
4.  In the answer key, list the question number and the correct option (e.g., "1. B").
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
