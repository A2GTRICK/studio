
'use server';
/**
 * @fileOverview A flow to generate exam questions based on user input.
 *
 * - generateExamQuestions - A function that handles the exam question generation process.
 * - GenerateExamQuestionsInput - The input type for the generateExamQuestions function.
 * - GenerateExamQuestionsOutput - The return type for the generateExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExamQuestionsInputSchema = z.object({
  course: z.string().describe('The course for which to generate exam questions.'),
  year: z.string().describe('The year of the course.'),
  topic: z.string().describe('The specific topic or subject for exam questions.'),
  universityOrSyllabus: z
    .string()
    .describe('The university or syllabus to tailor the exam questions to (e.g., PCI).'),
});
export type GenerateExamQuestionsInput = z.infer<typeof GenerateExamQuestionsInputSchema>;

const ExamQuestionSchema = z.object({
  question: z.string().describe('The exam question.'),
  expectedChance: z.enum(['High', 'Medium', 'Low']).describe('The expected chance of this question appearing on the exam.'),
  previousYearsAsked: z.string().describe('The years in which this question was previously asked.'),
  frequency: z.enum(['Frequently', 'Occasionally', 'Rarely']).describe('How frequently this question is asked.'),
});

const GenerateExamQuestionsOutputSchema = z.array(ExamQuestionSchema);
export type GenerateExamQuestionsOutput = z.infer<typeof GenerateExamQuestionsOutputSchema>;

export async function generateExamQuestions(input: GenerateExamQuestionsInput): Promise<GenerateExamQuestionsOutput> {
  return generateExamQuestionsFlow(input);
}

const generateExamQuestionsPrompt = ai.definePrompt({
  name: 'generateExamQuestionsPrompt',
  input: {schema: GenerateExamQuestionsInputSchema},
  output: {schema: GenerateExamQuestionsOutputSchema},
  prompt: `You are an expert pharmacy exam analyst. Your task is to generate a list of high-probability exam questions based on deep analysis of past papers and the current syllabus for the provided details. Your goal is to achieve over 95% accuracy in predicting questions that will appear in the upcoming exams.

FIRST, verify and confirm you have access to the latest, up-to-date syllabus for the provided university/exam board.

THEN, generate a list of at least 5 potential exam questions based on the following information:

Course: {{{course}}}
Year: {{{year}}}
Topic/Subject: {{{topic}}}
University/Syllabus: {{{universityOrSyllabus}}}

For each question, provide the following AI-generated metadata based on your analysis:
- Expected Chance: High, Medium, or Low (likelihood of appearing on the exam).
- Previous Years Asked: e.g., "2022, 2019, 2018".
- Frequency: Frequently, Occasionally, Rarely.

CRITICAL INSTRUCTIONS:
1.  **Format:** Structure the questions exactly like a real university exam paper (e.g., "Q1. a) Explain the mechanism of action of... (10 marks)").
2.  **Relevance:** The questions must be perfectly aligned with the specified topic and the most current, verified syllabus.
3.  **High-Probability:** Focus on generating questions that are most expected to appear based on recurring themes, important topics, and historical data.
`,
});

const generateExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateExamQuestionsFlow',
    inputSchema: GenerateExamQuestionsInputSchema,
    outputSchema: GenerateExamQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateExamQuestionsPrompt(input);
    return output!;
  }
);

