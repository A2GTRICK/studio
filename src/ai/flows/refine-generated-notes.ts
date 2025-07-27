
'use server';
/**
 * @fileOverview Implements the refineGeneratedNotes flow, which allows users to conversationally edit AI-generated notes.
 *
 * - refineGeneratedNotes - A function that takes previous notes and a refinement request, and returns new notes.
 * - RefineGeneratedNotesInput - The input type for the refineGeneratedNotes function.
 * - RefineGeneratedNotesOutput - The return type for the refineGeneratedNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineGeneratedNotesInputSchema = z.object({
  refinementRequest: z.string().describe('The user\'s request to change the notes (e.g., "Simplify this", "Add a table comparing X and Y").'),
  previousNotes: z.string().describe('The previously generated notes content in Markdown format.'),
});
export type RefineGeneratedNotesInput = z.infer<typeof RefineGeneratedNotesInputSchema>;

const RefineGeneratedNotesOutputSchema = z.object({
  notes: z.string().describe('The completely new, rewritten notes in Markdown format, incorporating the user\'s requested refinement.'),
});
export type RefineGeneratedNotesOutput = z.infer<typeof RefineGeneratedNotesOutputSchema>;

export async function refineGeneratedNotes(input: RefineGeneratedNotesInput): Promise<RefineGeneratedNotesOutput> {
  return refineGeneratedNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineGeneratedNotesPrompt',
  input: {schema: RefineGeneratedNotesInputSchema},
  output: {schema: RefineGeneratedNotesOutputSchema},
  prompt: `You are an AI assistant helping a pharmacy student. The student has generated a set of notes and now wants you to refine them.

  Here are the original notes:
  ---
  {{previousNotes}}
  ---

  The student's refinement request is:
  "{{refinementRequest}}"

  Your task is to REWRITE THE ENTIRE set of notes from scratch, fully incorporating the student's request. Do not just answer the request. The output must be the complete, updated version of the notes. Maintain the original structure and formatting (Markdown) unless the request specifies otherwise.
  `,
});

const refineGeneratedNotesFlow = ai.defineFlow(
  {
    name: 'refineGeneratedNotesFlow',
    inputSchema: RefineGeneratedNotesInputSchema,
    outputSchema: RefineGeneratedNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
