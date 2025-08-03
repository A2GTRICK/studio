
'use server';

/**
 * @fileOverview Handles conversational follow-up questions about generated notes.
 * 
 * - followUpOnNotes - A function that handles the follow-up conversation process.
 * - FollowUpOnNotesInput - The input type for the followUpOnNotes function.
 * - FollowUpOnNotesOutput - The return type for the followUpOnNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FollowUpOnNotesInputSchema = z.object({
  originalNotes: z.string().describe("The full text of the originally generated notes."),
  question: z.string().describe("The user's follow-up question or request."),
});
export type FollowUpOnNotesInput = z.infer<typeof FollowUpOnNotesInputSchema>;


const FollowUpOnNotesOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the follow-up question, in Markdown format.'),
});
export type FollowUpOnNotesOutput = z.infer<typeof FollowUpOnNotesOutputSchema>;


export async function followUpOnNotes(input: FollowUpOnNotesInput): Promise<FollowUpOnNotesOutput> {
  return followUpOnNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'followUpOnNotesPrompt',
  input: {schema: FollowUpOnNotesInputSchema},
  output: {schema: FollowUpOnNotesOutputSchema},
  prompt: `You are an expert AI academic coach. A user has generated a set of notes and is now asking a follow-up question or asking for a refinement.

Your task is to provide a clear, concise, and helpful response in Markdown format.

**Original Notes Context:**
---
{{{originalNotes}}}
---

**User's Follow-up Request:**
"{{{question}}}"

**Your Instructions:**
1.  **Understand the Request:** Carefully analyze the user's question. Are they asking for clarification, an example, a simplification, or an expansion on a topic?
2.  **Use the Context:** Your answer MUST be based on the provided "Original Notes Context".
3.  **Be Conversational and Helpful:** Address the user directly. Use a supportive and encouraging tone.
4.  **Format as Markdown:** Ensure your entire output is a single Markdown string. Use formatting like lists, bold text, and blockquotes to improve readability.

Generate a helpful answer to the user's request now.
`,
});


const followUpOnNotesFlow = ai.defineFlow(
  {
    name: 'followUpOnNotesFlow',
    inputSchema: FollowUpOnNotesInputSchema,
    outputSchema: FollowUpOnNotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid output.');
    }
    return output;
  }
);
