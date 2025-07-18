'use server';
/**
 * @fileOverview A flow to generate a set of MCQs for competitive exam practice.
 *
 * - generateMcqPractice - A function that handles the MCQ generation process.
 * - GenerateMcqPracticeInput - The input type for the function.
 * - GenerateMcqPracticeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMcqPracticeInputSchema = z.object({
  examType: z.string().describe('The target competitive exam (e.g., GPAT, NIPER, Pharmacist Exam).'),
  subject: z.string().describe('The subject within the exam syllabus.'),
  topic: z.string().optional().describe('The specific topic for the questions. If not provided, questions will be from the general subject.'),
  numberOfQuestions: z.number().int().min(1).max(20).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the questions.'),
});
export type GenerateMcqPracticeInput = z.infer<typeof GenerateMcqPracticeInputSchema>;

const McqQuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('An array of four possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
  explanation: z.string().describe('A detailed explanation for why the correct answer is right.'),
  previouslyAsked: z.string().optional().describe('The competitive exam and year this question was previously asked, if known (e.g., "GPAT 2021, Pharmacist Exam 2019"). Leave empty if not applicable.'),
});

const GenerateMcqPracticeOutputSchema = z.array(McqQuestionSchema);
export type GenerateMcqPracticeOutput = z.infer<typeof GenerateMcqPracticeOutputSchema>;

export async function generateMcqPractice(input: GenerateMcqPracticeInput): Promise<GenerateMcqPracticeOutput> {
  // In a real app, this would be a premium-only feature.
  // You would check the user's subscription status here.
  return generateMcqPracticeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMcqPracticePrompt',
  input: {schema: GenerateMcqPracticeInputSchema},
  output: {schema: GenerateMcqPracticeOutputSchema},
  prompt: `You are an expert examiner and question setter for high-stakes competitive pharmacy exams in India, such as GPAT, NIPER, and various government Pharmacist exams. Your task is to create a set of high-standard Multiple Choice Questions (MCQs) that accurately reflect the pattern, complexity, and syllabus of the specified exam.

  Generate a practice set of MCQs based on these parameters:
  - Target Exam: {{{examType}}}
  - Subject: {{{subject}}}
  {{#if topic}}- Topic: {{{topic}}}{{/if}}
  - Number of Questions: {{{numberOfQuestions}}}
  - Difficulty Level: {{{difficulty}}}

  CRITICAL INSTRUCTIONS:
  1.  **Question Standard:** Questions must be challenging, concept-based, and directly relevant to the competitive exam specified. Avoid simple, definition-based questions. They should require analytical thinking.
  2.  **Plausible Options:** The four options provided for each question must be plausible distractors. They should be closely related to the question to test the candidate's deep understanding, not just superficial knowledge.
  3.  **Correct Answer:** Clearly identify the correct answer.
  4.  **Detailed Explanation:** Provide a thorough explanation for each question. The explanation should not only state why the correct answer is right but also briefly explain why the other options are incorrect. This is crucial for learning.
  5.  **Previous Appearances:** For each question, if it is based on or identical to a question from a past paper, populate the 'previouslyAsked' field with the exam name and year (e.g., "GPAT 2021, NIPER 2019"). If the question is new or its history is unknown, leave this field empty.
  6.  **Relevance:** Ensure the questions align with the latest syllabus and question patterns for the '{{{examType}}}'.
  `,
});

const generateMcqPracticeFlow = ai.defineFlow(
  {
    name: 'generateMcqPracticeFlow',
    inputSchema: GenerateMcqPracticeInputSchema,
    outputSchema: GenerateMcqPracticeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
