
'use server';
/**
 * @fileOverview Generates notes on a specific topic using AI. Follow-up questions can be asked to refine the notes.
 *
 * - generateNotesFromTopic - A function that handles the note generation process.
 * - GenerateNotesFromTopicInput - The input type for the generateNotesFromTopic function.
 * - GenerateNotesFromTopicOutput - The return type for the generateNotesFromTopic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNotesFromTopicInputSchema = z.object({
  course: z.string().describe('The course for which the notes are being generated.'),
  year: z.string().describe('The year of study for which the notes are being generated.'),
  subject: z.string().describe('The subject for which the notes are being generated.'),
  topic: z.string().describe('The specific topic for which notes are to be generated.'),
});
export type GenerateNotesFromTopicInput = z.infer<typeof GenerateNotesFromTopicInputSchema>;

const GenerateNotesFromTopicOutputSchema = z.object({
  notes: z.string().describe('The generated notes in Markdown format.'),
});
export type GenerateNotesFromTopicOutput = z.infer<typeof GenerateNotesFromTopicOutputSchema>;

export async function generateNotesFromTopic(input: GenerateNotesFromTopicInput): Promise<GenerateNotesFromTopicOutput> {
  return generateNotesFromTopicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNotesFromTopicPrompt',
  input: {schema: GenerateNotesFromTopicInputSchema},
  output: {schema: GenerateNotesFromTopicOutputSchema},
  prompt: `You are an expert pharmacy tutor, renowned for creating detailed, accurate, and easy-to-understand study materials for pharmacy students. Your knowledge is based on standard, authoritative reference textbooks in the field of pharmacy.

  Generate a comprehensive set of notes on the given topic. The notes must be well-structured, using clear headings, subheadings, bullet points, and bold text for key terms. The output must be in Markdown format.

  Your response must be structured like a chapter from a high-quality textbook. Use Markdown for formatting:
  - Use '#' for the main title.
  - Use '##' for major section headings.
  - Use '###' for sub-headings.
  - Use '*' for bullet points.
  - Use '**text**' for bolding key terms.
  - Include practical examples where relevant to clarify complex concepts.

  Course: {{{course}}}
  Year: {{{year}}}
  Subject: {{{subject}}}
  Topic: {{{topic}}}

  Ensure the notes are thorough, accurate, and cover all critical concepts related to the topic, as a student would find in a reliable textbook.
  `,
});

const generateNotesFromTopicFlow = ai.defineFlow(
  {
    name: 'generateNotesFromTopicFlow',
    inputSchema: GenerateNotesFromTopicInputSchema,
    outputSchema: GenerateNotesFromTopicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
