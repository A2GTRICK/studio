// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview AI tool to generate notes based on course, year, subject, and topic inputs.
 *
 * - generateNotes - A function that handles the note generation process.
 * - GenerateNotesInput - The input type for the generateNotes function.
 * - GenerateNotesOutput - The return type for the generateNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNotesInputSchema = z.object({
  course: z.string().describe('The course for which notes are being generated.'),
  year: z.string().describe('The year of the course.'),
  subject: z.string().describe('The subject of the notes.'),
  topic: z.string().describe('The specific topic for the notes.'),
});
export type GenerateNotesInput = z.infer<typeof GenerateNotesInputSchema>;

const GenerateNotesOutputSchema = z.object({
  notes: z.string().describe('The generated notes in Markdown format.'),
});
export type GenerateNotesOutput = z.infer<typeof GenerateNotesOutputSchema>;

export async function generateNotes(input: GenerateNotesInput): Promise<GenerateNotesOutput> {
  return generateNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNotesPrompt',
  input: {schema: GenerateNotesInputSchema},
  output: {schema: GenerateNotesOutputSchema},
  prompt: `You are an AI assistant designed to generate notes for students.

  Please generate comprehensive and well-structured notes in Markdown format based on the following information:

  Course: {{{course}}}
  Year: {{{year}}}
  Subject: {{{subject}}}
  Topic: {{{topic}}}

  The notes should cover all essential aspects of the topic and be suitable for studying.
`,
});

const generateNotesFlow = ai.defineFlow(
  {
    name: 'generateNotesFlow',
    inputSchema: GenerateNotesInputSchema,
    outputSchema: GenerateNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
