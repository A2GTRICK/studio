'use server';
/**
 * @fileOverview Implements the answerFollowUpQuestion flow, which allows premium users to ask follow-up questions to the AI after generating notes.
 *
 * - answerFollowUpQuestion - A function that handles follow-up questions and provides detailed answers.
 * - AnswerFollowUpQuestionInput - The input type for the answerFollowUpQuestion function.
 * - AnswerFollowUpQuestionOutput - The return type for the answerFollowUpQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerFollowUpQuestionInputSchema = z.object({
  question: z.string().describe('The follow-up question asked by the user.'),
  previousNotes: z.string().describe('The previously generated notes on the topic.'),
});
export type AnswerFollowUpQuestionInput = z.infer<typeof AnswerFollowUpQuestionInputSchema>;

const AnswerFollowUpQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the follow-up question.'),
});
export type AnswerFollowUpQuestionOutput = z.infer<typeof AnswerFollowUpQuestionOutputSchema>;

export async function answerFollowUpQuestion(input: AnswerFollowUpQuestionInput): Promise<AnswerFollowUpQuestionOutput> {
  return answerFollowUpQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerFollowUpQuestionPrompt',
  input: {schema: AnswerFollowUpQuestionInputSchema},
  output: {schema: AnswerFollowUpQuestionOutputSchema},
  prompt: `You are an AI assistant helping pharmacy students understand complex topics.

  A student has previously generated the following notes:
  {{previousNotes}}

  Now, the student has asked the following follow-up question:
  {{question}}

  Please provide a detailed and clear answer to the question, referencing the previous notes where appropriate to provide context.
  Make sure to format your answer in markdown.
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
    return output!;
  }
);
