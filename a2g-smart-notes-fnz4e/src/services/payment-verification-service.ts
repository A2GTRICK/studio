
'use server';
/**
 * @fileOverview A service to manage payment verification requests by updating the user's document.
 */

import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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
 * It now uses setDoc with merge to avoid overwriting the user document if it doesn't exist,
 * though in this flow, it always should.
 * @param data The details of the purchase to be verified.
 */
export async function createVerificationRequest(data: CreateVerificationRequestInput): Promise<void> {
    const parsedData = CreateVerificationRequestInputSchema.safeParse(data);
    if (!parsedData.success) {
        throw new Error('Invalid verification request data.');
    }

    try {
        const userRef = doc(db, 'users', parsedData.data.uid);
        // Use setDoc with merge:true to safely add/update the payment request
        // without overwriting the entire user document.
        await setDoc(userRef, {
            paymentRequest: {
                productName: parsedData.data.productName,
                price: parsedData.data.price,
                status: 'pending',
                requestedAt: serverTimestamp(),
            }
        }, { merge: true });
    } catch (error) {
        console.error("Error creating payment verification request in user doc:", error);
        // This error is now handled silently in the payment dialog component.
        throw new Error("Could not log your payment for verification. Please contact support.");
    }
}
