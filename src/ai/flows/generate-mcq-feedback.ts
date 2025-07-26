
'use server';
/**
 * @fileOverview A flow to generate personalized feedback on a user's MCQ quiz performance.
 *
 * - generateMcqFeedback - A function that analyzes quiz results and provides tips.
 * - GenerateMcqFeedbackInput - The input type for the function.
 * - GenerateMcqFeedbackOutput - The return type for a function.
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
  performance: z.array(QuizPerformanceSchema).describe("A list of the user's performance on questions they answered incorrectly. This list ONLY contains incorrect answers."),
  score: z.number().describe("The user's score (e.g. 7)."),
  totalQuestions: z.number().describe("The total number of questions in the quiz (e.g. 10)."),
});
export type GenerateMcqFeedbackInput = z.infer<typeof GenerateMcqFeedbackInputSchema>;


const GenerateMcqFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized, actionable feedback for the user in Markdown format. The feedback should analyze wrong answers and suggest specific topics to revisit.'),
});
export type GenerateMcqFeedbackOutput = z.infer<typeof GenerateMcqFeedbackOutputSchema>;

export async function generateMcqFeedback(input: GenerateMcqFeedbackInput): Promise<GenerateMcqFeedbackOutput> {
  return generateMcqFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMcqFeedbackPrompt',
  input: {schema: GenerateMcqFeedbackInputSchema},
  output: {schema: GenerateMcqFeedbackOutputSchema},
  prompt: `You are an expert pharmacy tutor AI. A student has just completed a practice quiz. Your task is to provide concise, actionable, and personalized feedback based on their performance.

  The quiz was for the '{{examType}}' exam, covering the subject '{{subject}}' and the topic '{{topic}}'.
  The user scored {{score}} out of {{totalQuestions}}.

  Here are the questions the student answered incorrectly:
  {{#each performance}}
  ---
  Question: {{question}}
  User's Incorrect Answer: {{userAnswer}}
  Correct Answer: {{correctAnswer}}
  ---
  {{/each}}

  CRITICAL INSTRUCTIONS:
  1.  **Analyze Patterns:** Based on the user's score and the provided incorrect answers, identify patterns. Are they struggling with a specific concept?
  2.  **Provide Actionable Tips:** Give 2-3 specific, actionable tips. For example, instead of "study more," say "It seems you're confusing A and B. Review the chapter on X, focusing on the differences in their mechanisms."
  3.  **Suggest Focus Areas:** Recommend specific sub-topics the student should revisit.
  4.  **Tone & Format:** Be encouraging. Use Markdown with headings, bullet points, and emojis (💡, 🎯, 💪) to make it readable. Do not include conversational pleasantries, just the feedback.
  `,
});

const generateMcqFeedbackFlow = ai.defineFlow(
  {
    name: 'generateMcqFeedbackFlow',
    inputSchema: GenerateMcqFeedbackInputSchema,
    outputSchema: GenerateMcqFeedbackOutputSchema,
  },
  async input => {
    // The performance array is already pre-filtered to only include incorrect answers.
    // We can also limit it to a sample size to keep the prompt efficient.
    const performanceSample = input.performance.slice(0, 5); 
    
    const focusedInput = {
        ...input,
        performance: performanceSample,
    };

    const {output} = await prompt(focusedInput);
    return output!;
  }
);

    