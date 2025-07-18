// This file is machine-generated - edit with caution!
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
  prompt: `You are an experienced educator specializing in pharmacy. You are creating exam questions for pharmacy students to help them prepare for their exams.

Generate a list of potential exam questions based on the following information:

Course: {{{course}}}
Year: {{{year}}}
Topic/Subject: {{{topic}}}
University/Syllabus: {{{universityOrSyllabus}}}

For each question, also provide the following AI-generated metadata:

- Expected Chance: High, Medium, or Low (likelihood of appearing on the exam).
- Previous Years Asked: e.g., \"2022, 2019\".
- Frequency: Frequently, Occasionally, Rarely (how often the question is asked).

Format the questions like a real exam paper (e.g., \"Q1. a) ... (10 marks)\"). Ensure questions are well-structured and relevant to the specified topic and syllabus.

Make sure that the list of questions include at least 5 questions.
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
