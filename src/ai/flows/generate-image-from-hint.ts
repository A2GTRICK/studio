'use server';
/**
 * @fileOverview A flow to generate an image based on a text hint.
 *
 * - generateImageFromHint - A function that handles the image generation process.
 * - GenerateImageFromHintInput - The input type for the function.
 * - GenerateImageFromHintOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateImageFromHintInputSchema = z.object({
  hint: z.string().describe('A one or two-word hint for the image to be generated.'),
});
export type GenerateImageFromHintInput = z.infer<typeof GenerateImageFromHintInputSchema>;

const GenerateImageFromHintOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a Base64 encoded data URI.'),
});
export type GenerateImageFromHintOutput = z.infer<typeof GenerateImageFromHintOutputSchema>;

export async function generateImageFromHint(input: GenerateImageFromHintInput): Promise<GenerateImageFromHintOutput> {
  return generateImageFromHintFlow(input);
}

const generateImageFromHintFlow = ai.defineFlow(
  {
    name: 'generateImageFromHintFlow',
    inputSchema: GenerateImageFromHintInputSchema,
    outputSchema: GenerateImageFromHintOutputSchema,
  },
  async ({ hint }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a high-quality, professional, photorealistic image suitable for a website for pharmacy students in India. The image subject is: ${hint}. The image should be clean, well-lit, and visually appealing.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce an output.');
    }

    return { imageDataUri: media.url };
  }
);
