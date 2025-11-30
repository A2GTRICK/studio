
'use server';

/**
 * @fileOverview Fetches and curates real, authoritative pharmacy news and announcements.
 * 
 * - fetchPharmacyNews - A function that acts as a directory service, returning links to trusted sources.
 */

import { ai } from '@/ai/genkit';
import { PharmacyNewsOutputSchema } from './types';

export async function fetchPharmacyNews() {
  try {
    const newsFlow = ai.defineFlow(
      {
        name: 'fetchPharmacyNewsFlow',
        outputSchema: PharmacyNewsOutputSchema,
      },
      async () => {
        const llmResponse = await ai.generate({
          prompt: `You are an expert news curator for Indian pharmacy students. Your task is to act as a directory service.
          
          **CRITICAL INSTRUCTION: DO NOT INVENT OR CREATE NEWS HEADLINES.**
          
          Your ONLY job is to provide a list of 5-7 real, trusted, and verifiable online sources for pharmacy-related announcements. For each source, provide a valid, direct URL.
          
          **Example sources include:**
          - Pharmacy Council of India (PCI) website for circulars.
          - Official university websites (e.g., GTU, RGUHS) for exam schedules.
          - Reputable job boards (e.g., PharmaTutor, LinkedIn) for hiring news.
          - Official government sites (e.g., NTA) for GPAT/NIPER alerts.
          
          For each source, create a notification object with a title, a summary of what the link contains, a category, a recent date (within the last few months), and the full source URL.
          
          Return a valid JSON array of these objects.`,
          output: {
            schema: PharmacyNewsOutputSchema,
          },
          config: {
            temperature: 0.1, // Low temperature to stick to facts and directory-style output
          },
        });
        
        return llmResponse.output() || [];
      }
    );
    
    return await newsFlow();

  } catch (error) {
    console.error("Error in fetchPharmacyNews flow:", error);
    // In case of an AI model error (e.g., overloaded), gracefully return an empty array.
    // This prevents the UI from crashing.
    return [];
  }
}
