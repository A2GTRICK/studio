
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
    // In a real application, you would add the user's email to a mailing list
    // using a service like Mailchimp, SendGrid, etc.
    console.log(`Subscribing ${input.email} to the newsletter.`);

    // For this example, we'll just return a confirmation and a dummy link.
    // The link now points to a real file in the `public` directory.
    return {
      message: `Successfully subscribed ${input.email}!`,
      downloadLink: '/assets/Top-20-Pharmacology-Questions.pdf'
    };
  }
);
