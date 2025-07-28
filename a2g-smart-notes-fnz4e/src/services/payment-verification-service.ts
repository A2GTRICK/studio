
'use client';
/**
 * @fileOverview A CLIENT-SIDE service to manage payment verification requests.
 * This function runs in the user's browser.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const CreateVerificationRequestInputSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  productName: z.string(),
  price: z.string(),
});

export type CreateVerificationRequestInput = z.infer<typeof CreateVerificationRequestInputSchema>;

/**
 * Creates a new payment verification request document in the 'payment_verifications' collection.
 * This is triggered when a user clicks "I Have Paid" in the payment dialog.
 * This function is now designed to be called directly from the client.
 * @param data The details of the purchase to be verified.
 */
export async function createVerificationRequest(data: CreateVerificationRequestInput): Promise<void> {
    const parsedData = CreateVerificationRequestInputSchema.safeParse(data);
    if (!parsedData.success) {
        throw new Error('Invalid verification request data.');
    }

    try {
        await addDoc(collection(db, 'payment_verifications'), {
            uid: parsedData.data.uid,
            productName: parsedData.data.productName,
            price: parsedData.data.price,
            status: 'pending', // Default status is always pending
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating payment verification request:", error);
        // We throw the error so the client can inform the user if logging fails.
        throw new Error("Could not log your payment for verification. Please contact support.");
    }
}
