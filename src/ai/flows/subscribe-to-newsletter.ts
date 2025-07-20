
'use server';
/**
 * @fileOverview A flow to handle newsletter subscriptions and provide a lead magnet download.
 *
 * - subscribeToNewsletter - A function that handles the subscription process.
 * - SubscribeToNewsletterInput - The input type for the subscribeToNewsletter function.
 * - SubscribeToNewsletterOutput - The return type for the subscribeToNewsletter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SubscribeToNewsletterInputSchema = z.object({
  email: z.string().email().describe('The email address of the user subscribing.'),
});
export type SubscribeToNewsletterInput = z.infer<typeof SubscribeToNewsletterInputSchema>;

const SubscribeToNewsletterOutputSchema = z.object({
  message: z.string().describe('A confirmation message for the subscription.'),
  downloadLink: z.string().describe('A link to download the free PDF.'),
});
export type SubscribeToNewsletterOutput = z.infer<typeof SubscribeToNewsletterOutputSchema>;


export async function subscribeToNewsletter(input: SubscribeToNewsletterInput): Promise<SubscribeToNewsletterOutput> {
  return subscribeToNewsletterFlow(input);
}


const subscribeToNewsletterFlow = ai.defineFlow(
  {
    name: 'subscribeToNewsletterFlow',
    inputSchema: SubscribeToNewsletterInputSchema,
    outputSchema: SubscribeToNewsletterOutputSchema,
  },
  async (input) => {
    // Save the user's email to the 'newsletter_subscriptions' collection in Firestore.
    try {
      await addDoc(collection(db, 'newsletter_subscriptions'), {
        email: input.email,
        subscribedAt: serverTimestamp(),
      });
    } catch (error) {
        console.error("Error saving email to Firestore:", error);
        // We can still proceed even if saving fails, so the user gets their PDF.
        // In a production app, you might want more robust error handling/logging here.
    }


    // The link now points to a real file in the `public` directory.
    return {
      message: `Thanks for subscribing! While your PDF downloads, feel free to explore our app's features.`,
      downloadLink: '/assets/Top-20-Pharmacology-Questions.pdf'
    };
  }
);
