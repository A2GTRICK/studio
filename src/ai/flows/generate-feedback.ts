
'use server';

/**
 * @fileOverview Provides AI-powered performance feedback based on incorrect quiz answers.
 * 
 * - generateFeedback - A function that handles the feedback generation process.
 * - GenerateFeedbackInput - The input type for the generateFeedback function.
 * - GenerateFeedbackOutput - The return type for the generateFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IncorrectQuestionSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  explanation: z.string(),
});

const GenerateFeedbackInputSchema = z.object({
  incorrectQuestions: z.array(IncorrectQuestionSchema).describe("An array of questions the user answered incorrectly."),
});
export type GenerateFeedbackInput = z.infer<typeof GenerateFeedbackInputSchema>;


const GenerateFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized, actionable feedback in Markdown format.'),
});
export type GenerateFeedbackOutput = z.infer<typeof GenerateFeedbackOutputSchema>;


export async function generateFeedback(input: GenerateFeedbackInput): Promise<GenerateFeedbackOutput> {
  return generateFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFeedbackPrompt',
  input: {schema: GenerateFeedbackInputSchema},
  output: {schema: GenerateFeedbackOutputSchema},
  prompt: `You are an expert AI academic coach for pharmacy students preparing for competitive exams. A student has just completed a quiz and you are provided with the questions they answered incorrectly.

Your task is to analyze these incorrect answers to identify patterns and provide personalized, actionable feedback to help the student improve.

**User's Incorrect Questions:**
{{#each incorrectQuestions}}
- **Question:** {{question}}
  - **User's (Incorrect) Answer:** {{userAnswer}}
  - **Correct Answer:** {{correctAnswer}}
  - **Explanation:** {{explanation}}
---
{{/each}}

**Analysis and Feedback Instructions:**
1.  **Identify Patterns:** Do not just list the mistakes. Analyze them. Is there a recurring theme? 
    - Are they struggling with a specific concept (e.g., drug classifications, mechanisms of action)?
    - Are they making calculation errors?
    - Do they seem to misunderstand terminology?
    - Are they getting confused by similar-sounding drug names?
2.  **Provide Actionable Advice:** Based on the patterns, give concrete, encouraging advice.
    - Suggest specific topics or sub-topics to revisit.
    - Recommend learning strategies (e.g., "It seems like you're mixing up drug suffixes. Try creating a chart to link suffixes like '-olol' to beta-blockers.").
    - Frame the feedback positively. Instead of "You are weak in...", say "Here's an opportunity to strengthen your understanding of...".
3.  **Keep it Concise:** The feedback should be easy to digest. Use bullet points and bold text to structure the output.
4.  **Format as Markdown:** The entire output should be a single Markdown string.

Generate the feedback now.
`,
});


const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: GenerateFeedbackInputSchema,
    outputSchema: GenerateFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate feedback. The AI model did not return a valid output.');
    }
    return output;
  }
);
