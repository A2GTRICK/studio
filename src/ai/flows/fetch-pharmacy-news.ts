
'use server';
/**
 * @fileOverview A flow to fetch a list of valuable, real pharmacy news sources for notifications.
 *
 * - fetchPharmacyNews - A function that returns a list of links to trusted news sources.
 * - PharmacyNewsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { PharmacyNewsOutput, PharmacyNewsOutputSchema } from './types';


export async function fetchPharmacyNews(): Promise<PharmacyNewsOutput> {
  const prompt = `You are an AI assistant for Indian pharmacy students. Your task is to provide a helpful directory of 5-7 trusted online sources where students can find the latest news and updates. DO NOT INVENT NEWS. Your only job is to point to real websites.

  CRITICAL INSTRUCTIONS:
  1.  **Do Not Invent News:** You MUST NOT create specific news headlines (e.g., "GPAT Results Declared"). Instead, you will create a directory of links to real sources.
  2.  **Title is the Source:** The 'title' field MUST describe the source or the category of information found there. For example: "PCI Official Circulars", "PharmaTutor Job Board", "BTEUP Exam Updates".
  3.  **Summary is a Guide:** The 'summary' field MUST describe what the user can typically find at the link. For example: "Visit the official Pharmacy Council of India website for the latest circulars, notices, and syllabus updates."
  4.  **Source URL is KEY:** The 'source' field MUST be a valid, real, working URL to the HOMEPAGE of a trusted Indian pharmacy or medical source. Examples of valid source URLs are:
      *   https://www.pci.nic.in/
      *   https://pharmatutor.org/
      *   https://medicaldialogues.in/pharmacy
      *   https://www.aiims.edu/en.html
      *   https://www.esic.gov.in/recruitments
      *   https://nta.ac.in/
      *   https://aktu.ac.in/
      *   https://bteup.ac.in/
  5.  **Diverse Sources:** Provide a mix of sources covering job notifications, official circulars, and general news. Include sources for paramedical jobs, and especially include AKTU and BTEUP.
  6.  **Recent Date:** Assign a recent, plausible date to each item to indicate when this directory entry was last "verified".
  7.  **Output Format**: Respond with a JSON array of objects that conforms to the required schema.
  `;
    
    const newsFlow = ai.defineFlow(
      {
        name: 'fetchPharmacyNewsFlow',
        outputSchema: PharmacyNewsOutputSchema,
      },
      async () => {
          try {
            const llmResponse = await ai.generate({
              prompt: prompt,
              output: {
                schema: PharmacyNewsOutputSchema,
              },
              config: {
                temperature: 0.1, 
              },
            });

            return llmResponse.output() || [];

        } catch(e: any) {
            // Check for 503-like errors from Google AI
            if (e.message?.includes('503') || e.message?.includes('overloaded')) {
                console.warn("AI model is overloaded. Returning empty array for notifications.", e);
                // Return an empty array to gracefully handle the overloaded model error.
                return []; 
            }
            console.error("Failed to fetch pharmacy news:", e);
            // Re-throw other errors
            throw e;
        }
      }
    );
    
    return await newsFlow();
}

