
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
  course: z.string().describe('The course for which notes are being generated (e.g., B.Pharm, D.Pharm).'),
  year: z.string().describe('The academic year of the course.'),
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
  prompt: `You are an expert pharmacy tutor and academic assistant. Your task is to generate comprehensive, well-structured study notes based on standard reference textbooks.

The user is a student in the following course:
- Course: {{{course}}}
- Year: {{{year}}}
- Subject: {{{subject}}}

Please generate detailed notes on the following topic:
- Topic: {{{topic}}}

The output must be in Markdown format. Use headings, subheadings, bullet points, and bolded keywords to create a clear and organized structure, similar to a chapter in a textbook. This will help the student understand the material effectively. Ensure the content is accurate, in-depth, and directly relevant to the provided subject and topic.
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
