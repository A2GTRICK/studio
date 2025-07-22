
'use server';
/**
 * @fileOverview A flow to generate an image based on a text hint, with Firestore caching.
 *
 * - generateImageFromHint - A function that handles the image generation process.
 * - GenerateImageFromHintInput - The input type for the function.
 * - GenerateImageFromHintOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCachedImage, setCachedImage } from '@/services/image-cache-service';

const GenerateImageFromHintInputSchema = z.object({
  hint: z.string().describe('A one or two-word hint for the image to be generated, or a complex prompt for image-to-image tasks.'),
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
    // 1. Check for a cached image first.
    const cachedImage = await getCachedImage(hint);
    if (cachedImage) {
      return { imageDataUri: cachedImage };
    }
    
    let prompt: any;
    // Check if hint is a complex prompt for image-to-image
    if (hint.includes(';;')) {
      const [text, url] = hint.split(';;');
      prompt = [
        {text: text},
        {media: {url: url}}
      ];
    } else {
      prompt = `Generate a high-quality, professional, photorealistic image suitable for a website for pharmacy students in India. The image subject is: ${hint}. The image should be clean, well-lit, and visually appealing.`;
    }

    // 2. If not in cache, generate a new image.
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed to produce an output.');
    }
    
    const imageDataUri = media.url;

    // 3. Save the newly generated image to the cache for future requests.
    await setCachedImage(hint, imageDataUri);

    return { imageDataUri };
  }
);
