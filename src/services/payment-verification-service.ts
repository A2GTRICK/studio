
'use server';
/**
 * @fileOverview A service to manage payment verification requests by updating the user's document.
 */

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const CreateVerificationRequestInputSchema = z.object({
  uid: z.string().min(1),
  productName: z.string(),
  price: z.string(),
});

export type CreateVerificationRequestInput = z.infer<typeof CreateVerificationRequestInputSchema>;

/**
 * Updates a user's document in Firestore with a payment verification request.
 * This is triggered when a user clicks "I Have Paid" in the payment dialog.
 * @param data The details of the purchase to be verified.
 */
export async function createVerificationRequest(data: CreateVerificationRequestInput): Promise<void> {
    const parsedData = CreateVerificationRequestInputSchema.safeParse(data);
    if (!parsedData.success) {
        throw new Error('Invalid verification request data.');
    }

    try {
        const userRef = doc(db, 'users', parsedData.data.uid);
        await updateDoc(userRef, {
            paymentRequest: {
                productName: parsedData.data.productName,
                price: parsedData.data.price,
                status: 'pending',
                requestedAt: serverTimestamp(),
            }
        });
    } catch (error) {
        console.error("Error creating payment verification request in user doc:", error);
        throw new Error("Could not log your payment for verification. Please contact support.");
    }
}
