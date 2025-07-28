
'use server';
/**
 * @fileOverview A function to handle newsletter subscriptions and provide a lead magnet download.
 *
 * - subscribeToNewsletter - A function that handles the subscription process.
 * - SubscribeToNewsletterInput - The input type for the subscribeToNewsletter function.
 * - SubscribeToNewsletterOutput - The return type for the subscribeToNewsletter function.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

// --- ADMIN-MANAGED DOWNLOAD LINK ---
// To change the file users get when they subscribe,
// update the file in the `public/assets` folder and then change the link below.
const LEAD_MAGNET_DOWNLOAD_LINK = '/assets/Top-20-Pharmacology-Questions.pdf';
// ------------------------------------

const SubscribeToNewsletterInputSchema = z.object({
  email: z.string().email(),
});
export type SubscribeToNewsletterInput = z.infer<typeof SubscribeToNewsletterInputSchema>;

export interface SubscribeToNewsletterOutput {
  message: string;
  downloadLink: string;
}

/**
 * Saves a user's email to the newsletter subscription list in Firestore
 * and returns a download link for a lead magnet.
 * @param input - The user's email.
 * @returns A confirmation message and a download link.
 */
export async function subscribeToNewsletter(input: SubscribeToNewsletterInput): Promise<SubscribeToNewsletterOutput> {
  const parsedInput = SubscribeToNewsletterInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error('Invalid email provided.');
  }

  // Save the user's email to the 'newsletter_subscriptions' collection in Firestore.
  try {
    await addDoc(collection(db, 'newsletter_subscriptions'), {
      email: parsedInput.data.email,
      subscribedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving email to Firestore:", error);
    // We can still proceed even if saving fails, so the user gets their PDF.
    // In a production app, you might want more robust error handling/logging here.
  }

  // Return the configured download link.
  return {
    message: "Thanks for subscribing! Your PDF is downloading now. Feel free to explore our app's features.",
    downloadLink: LEAD_MAGNET_DOWNLOAD_LINK,
  };
}
