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
  detailLevel: z
    .enum(['Standard', 'Detailed', 'Competitive Exam Focus'])
    .describe('The desired level of detail for the generated notes.'),
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
  prompt: `You are an expert pharmacy tutor, skilled at creating concise and informative notes for pharmacy students.

  Based on the following information, generate well-structured notes in Markdown format.

  Course: {{{course}}}
  Year: {{{year}}}
  Subject: {{{subject}}}
  Topic: {{{topic}}}
  Level of Detail: {{{detailLevel}}}

  Ensure the notes are accurate, easy to understand, and cover the key concepts of the topic.
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
