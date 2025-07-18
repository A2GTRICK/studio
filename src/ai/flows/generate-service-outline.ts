
'use server';
/**
 * @fileOverview A flow to generate a service outline or methodology based on user input.
 *
 * - generateServiceOutline - A function that handles the outline generation process.
 * - GenerateServiceOutlineInput - The input type for the generateServiceOutline function.
 * - GenerateServiceOutlineOutput - The return type for the generateServiceOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateServiceOutlineInputSchema = z.object({
  academicLevel: z.string().describe('The academic level of the student (e.g., B.Pharm, M.Pharm, PhD).'),
  serviceType: z.string().describe('The type of academic service the user needs (e.g., Internship Report, Dissertation).'),
  topic: z.string().describe('The specific topic or subject for the service.'),
});
export type GenerateServiceOutlineInput = z.infer<typeof GenerateServiceOutlineInputSchema>;

const GenerateServiceOutlineOutputSchema = z.object({
  outline: z.string().describe('A structured outline or methodology for the requested service in Markdown format.'),
});
export type GenerateServiceOutlineOutput = z.infer<typeof GenerateServiceOutlineOutputSchema>;

export async function generateServiceOutline(input: GenerateServiceOutlineInput): Promise<GenerateServiceOutlineOutput> {
  return generateServiceOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateServiceOutlinePrompt',
  input: {schema: GenerateServiceOutlineInputSchema},
  output: {schema: GenerateServiceOutlineOutputSchema},
  prompt: `You are an expert academic consultant. A student requires help with a specific task.
Your goal is to provide a clear, structured, and helpful outline or methodology for their project based on their input.
This will demonstrate your expertise and help them get started.

Academic Level: {{{academicLevel}}}
Service Type Requested: {{{serviceType}}}
Topic: {{{topic}}}

Generate a professional, fully structured outline in Markdown format. The complexity and depth of the outline must be appropriate for the specified academic level.
This should be a complete outline model, covering all the standard points and parameters the student will need to address.

For example, if they ask for an "Internship Report" for a B.Pharm student, you must provide standard section headings like "Introduction," "Company Profile," "Aims and Objectives," "Work Performed," "Results and Discussion," "Conclusion," and "References."

If they ask for a "Dissertation" for an M.Pharm or PhD student, provide a much more detailed research methodology outline, including sections like "Introduction/Literature Review," "Problem Statement," "Research Questions/Hypotheses," "Methodology (Research Design, Sampling, Data Collection Instruments, Data Analysis Plan)," "Expected Outcomes," and "Timeline."

The outline must be comprehensive enough to be genuinely useful and serve as a strong foundation for their work.
`,
});

const generateServiceOutlineFlow = ai.defineFlow(
  {
    name: 'generateServiceOutlineFlow',
    inputSchema: GenerateServiceOutlineInputSchema,
    outputSchema: GenerateServiceOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
