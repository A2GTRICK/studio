
'use server';
/**
 * @fileOverview A function to handle newsletter subscriptions.
 *
 * - subscribeToNewsletter - A function that handles the subscription process.
 * - SubscribeToNewsletterInput - The input type for the subscribeToNewsletter function.
 * - SubscribeToNewsletterOutput - The return type for the subscribeToNewsletter function.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const SubscribeToNewsletterInputSchema = z.object({
  email: z.string().email(),
});
export type SubscribeToNewsletterInput = z.infer<typeof SubscribeToNewsletterInputSchema>;

export interface SubscribeToNewsletterOutput {
  message: string;
}

/**
 * Saves a user's email to the newsletter subscription list in Firestore.
 * @param input - The user's email.
 * @returns A confirmation message.
 */
export async function subscribeToNewsletter(input: SubscribeToNewsletterInput): Promise<SubscribeToNewsletterOutput> {
  const parsedInput = SubscribeToNewsletterInputSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new Error('Invalid email provided.');
  }

  try {
    await addDoc(collection(db, 'newsletter_subscriptions'), {
      email: parsedInput.data.email,
      subscribedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving email to Firestore:", error);
    throw new Error("Could not subscribe. Please try again later.");
  }

  return {
    message: "Thanks for subscribing! You'll receive the latest updates directly in your inbox.",
  };
}
