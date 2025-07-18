'use server';
/**
 * @fileOverview A flow to generate personalized feedback on a user's MCQ quiz performance.
 *
 * - generateMcqFeedback - A function that analyzes quiz results and provides tips.
 * - GenerateMcqFeedbackInput - The input type for the function.
 * - GenerateMcqFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuizPerformanceSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  userAnswer: z.string().describe('The answer the user selected.'),
  correctAnswer: z.string().describe('The correct answer for the question.'),
  isCorrect: z.boolean().describe('Whether the user answered correctly.'),
});

const GenerateMcqFeedbackInputSchema = z.object({
  examType: z.string().describe('The target competitive exam.'),
  subject: z.string().describe('The subject of the quiz.'),
  topic: z.string().describe('The specific topic of the quiz.'),
  performance: z.array(QuizPerformanceSchema).describe("The user's performance on each question."),
});
export type GenerateMcqFeedbackInput = z.infer<typeof GenerateMcqFeedbackInputSchema>;


const GenerateMcqFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized, actionable feedback for the user in Markdown format.'),
});
export type GenerateMcqFeedbackOutput = z.infer<typeof GenerateMcqFeedbackOutputSchema>;

export async function generateMcqFeedback(input: GenerateMcqFeedbackInput): Promise<GenerateMcqFeedbackOutput> {
  return generateMcqFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMcqFeedbackPrompt',
  input: {schema: GenerateMcqFeedbackInputSchema},
  output: {schema: GenerateMcqFeedbackOutputSchema},
  prompt: `You are an expert pharmacy tutor AI. A student has just completed a practice quiz. Your task is to provide encouraging, actionable, and personalized feedback based on their performance.

  The quiz was for the '{{examType}}' exam, covering the subject '{{subject}}' and the topic '{{topic}}'.

  Here is the student's performance data:
  {{#each performance}}
  ---
  Question: {{question}}
  User's Answer: {{userAnswer}}
  Correct Answer: {{correctAnswer}}
  Result: {{#if isCorrect}}Correct{{else}}Incorrect{{/if}}
  ---
  {{/each}}

  CRITICAL INSTRUCTIONS:
  1.  **Analyze Performance:** Start by calculating the user's score and identifying any patterns in their incorrect answers. Are they struggling with a specific concept within the topic?
  2.  **Provide Actionable Tips:** Based on your analysis, provide 2-3 specific, actionable tips. For example, instead of saying "study more," say "It seems you're confusing A and B. Review the chapter on X, focusing on the differences in their mechanisms."
  3.  **Suggest Focus Areas:** Recommend specific sub-topics or concepts the student should revisit.
  4.  **Tone:** Be encouraging and supportive, like a friendly mentor. Avoid being harsh. Start with a positive reinforcement, even if the score is low.
  5.  **Format:** Your entire response must be in Markdown format. Use headings, bullet points, and bold text to make it easy to read.
  `,
});

const generateMcqFeedbackFlow = ai.defineFlow(
  {
    name: 'generateMcqFeedbackFlow',
    inputSchema: GenerateMcqFeedbackInputSchema,
    outputSchema: GenerateMcqFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
