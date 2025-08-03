
'use server';

/**
 * @fileOverview AI tool to answer follow-up questions about generated notes.
 *
 * - answerFollowUpQuestion - A function that handles the follow-up question process.
 * - AnswerFollowUpQuestionInput - The input type for the answerFollowUpQuestion function.
 * - AnswerFollowUpQuestionOutput - The return type for the answerFollowUpQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerFollowUpQuestionInputSchema = z.object({
  topic: z.string().describe('The topic of the original notes.'),
  previousNotes: z.string().describe('The previously generated notes.'),
  userQuestion: z.string().describe('The user\'s follow-up question.'),
});
export type AnswerFollowUpQuestionInput = z.infer<typeof AnswerFollowUpQuestionInputSchema>;

const AnswerFollowUpQuestionOutputSchema = z.object({
  answer: z.string().describe('The generated answer in Markdown format.'),
});
export type AnswerFollowUpQuestionOutput = z.infer<typeof AnswerFollowUpQuestionOutputSchema>;

export async function answerFollowUpQuestion(input: AnswerFollowUpQuestionInput): Promise<AnswerFollowUpQuestionOutput> {
  return answerFollowUpQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFollowUpQuestionPrompt',
  input: {schema: AnswerFollowUpQuestionInputSchema},
  output: {schema: AnswerFollowUpQuestionOutputSchema},
  prompt: `You are the same assistant who generated the previous notes for this pharmacy topic:

**Topic:** {{ topic }}

**Previously Generated Notes:**
{{ previousNotes }}

The user now asks:
**“{{ userQuestion }}”**

Your task:
- Give a **focused follow-up answer**
- Use Markdown formatting
- Include examples or tables if needed
- Be concise but clear and helpful

End your reply with:
*More academic help? Just ask below! – phamA2G AI*
`,
});

const answerFollowUpQuestionFlow = ai.defineFlow(
  {
    name: 'answerFollowUpQuestionFlow',
    inputSchema: AnswerFollowUpQuestionInputSchema,
    outputSchema: AnswerFollowUpQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return { answer: output!.answer };
  }
);
