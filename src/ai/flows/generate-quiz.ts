
'use server';

/**
 * @fileOverview Generates a high-quality, exam-focused quiz from provided parameters.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  targetExam: z.string().describe('The target competitive exam (e.g., GPAT, NIPER).'),
  subject: z.string().describe('The subject of the quiz.'),
  topic: z.string().optional().describe('The specific topic or chapter within the subject.'),
  numQuestions: z.number().min(5).max(20).describe('The number of questions to generate.'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty level of the questions.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The question text.'),
      options: z.array(z.string()).length(4).describe('An array of four possible answers.'),
      correctAnswer: z.string().describe('The correct answer from the options array.'),
      explanation: z.string().describe('A detailed explanation for why the answer is correct.'),
    })
  ).describe('An array of quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;


export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert Question Paper Setter for competitive pharmacy exams in India. Your task is to generate a challenging Multiple Choice Question (MCQ) quiz based on the user's specifications. The questions must be high-quality, conceptually accurate, and reflective of the patterns seen in exams like GPAT, NIPER, and Drug Inspector tests.

**User's Request:**
- **Target Exam:** {{ targetExam }}
- **Subject:** {{ subject }}
{{#if topic}}- **Topic:** {{ topic }}{{/if}}
- **Number of Questions:** {{ numQuestions }}
- **Difficulty:** {{ difficulty }}

**Instructions:**
1.  **Generate {{ numQuestions }} MCQs.**
2.  **Format:** For each question, provide:
    - A clear and unambiguous **question** statement.
    - Four plausible **options**.
    - The **correctAnswer** (must be one of the four options).
    - A detailed **explanation** that clarifies why the correct answer is right and, if relevant, why the other options are wrong. The explanation is the most critical part for learning.
3.  **Quality:**
    - **Difficulty:** Adhere strictly to the requested **{{ difficulty }}** level.
        - **Easy:** Foundational concepts, direct recall.
        - **Medium:** Application-based, requires linking concepts.
        - **Hard:** Complex scenarios, requires deep analysis, or involves multiple concepts.
    - **Plausibility:** Incorrect options (distractors) should be plausible and based on common misconceptions.
    - **Accuracy:** All information must be accurate and based on standard pharmacy textbooks (e.g., Rang & Dale, Goodman & Gilman, Lachman, Kokate).

Generate the output in the required JSON format.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate quiz. The AI model did not return a valid output.');
    }
    return output;
  }
);
