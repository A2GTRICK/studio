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

export const GenerateServiceOutlineInputSchema = z.object({
  serviceType: z.string().describe('The type of academic service the user needs (e.g., Internship Report, Dissertation).'),
  topic: z.string().describe('The specific topic or subject for the service.'),
});
export type GenerateServiceOutlineInput = z.infer<typeof GenerateServiceOutlineInputSchema>;

export const GenerateServiceOutlineOutputSchema = z.object({
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

Service Type Requested: {{{serviceType}}}
Topic: {{{topic}}}

Generate a professional outline in Markdown format. For example, if they ask for an "Internship Report," you should provide standard section headings like "Introduction," "Company Profile," "Work Performed," etc. If they ask for a "Dissertation," provide a research methodology outline.

The outline should be high-level but comprehensive enough to be genuinely useful.
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
