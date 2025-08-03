'use server';

/**
 * @fileOverview AI tool to summarize a given document or text.
 *
 * - summarizeDocument - A function that handles the document summarization process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  document: z.string().describe('The document or text to be summarized.'),
});
export type SummarizeDocumentInput = z.infer<
  typeof SummarizeDocumentInputSchema
>;

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('The generated summary in Markdown format.'),
});
export type SummarizeDocumentOutput = z.infer<
  typeof SummarizeDocumentOutputSchema
>;

export async function summarizeDocument(
  input: SummarizeDocumentInput
): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You are an AI assistant designed to summarize documents for students.

  Please generate a concise and comprehensive summary in Markdown format for the following document:

  Document:
  {{{document}}}

  The summary should capture the key points and main ideas of the text.
`,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
