
'use server';
/**
 * @fileOverview A function to handle newsletter subscriptions and provide a lead magnet download.
 *
 * - subscribeToNewsletter - A function that handles the subscription process.
 * - SubscribeToNewsletterInput - The input type for the subscribeToNewsletter function.
 * - SubscribeToNewsletterOutput - The return type for the subscribeToNewsletter function.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { z } from 'zod';


const SubscribeToNewsletterInputSchema = z.object({
  email: z.string().email(),
});
export type SubscribeToNewsletterInput = z.infer<typeof SubscribeToNewsletterInputSchema>;

export interface SubscribeToNewsletterOutput {
  message: string;
  downloadLink: string;
  fileName: string;
}

/**
 * Saves a user's email to the newsletter subscription list in Firestore
 * and returns a download link for the most recently added lead magnet.
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
    // We can still proceed even if saving fails, so the user gets their file.
  }

  // Fetch the most recently added marketing material to use as the lead magnet.
  const materialsCollection = collection(db, 'marketing_materials');
  const q = query(materialsCollection, orderBy('createdAt', 'desc'), limit(1));
  const materialsSnapshot = await getDocs(q);

  if (materialsSnapshot.empty) {
    console.error("No lead magnet has been configured in the admin panel.");
    throw new Error("Sorry, the download is currently unavailable. Please check back later.");
  }
  
  const leadMagnet = materialsSnapshot.docs[0].data();

  return {
    message: "Thanks for subscribing! Your file is downloading now.",
    downloadLink: leadMagnet.content, // This is the Data URL for the file
    fileName: leadMagnet.fileName || "download.pdf",
  };
}
