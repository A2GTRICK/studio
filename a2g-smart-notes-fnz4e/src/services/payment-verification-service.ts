
'use server';
/**
 * @fileOverview A service to manage payment verification requests by creating a new document in a dedicated collection.
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { z } from 'zod';

const CreateVerificationRequestInputSchema = z.object({
  uid: z.string().min(1),
  productName: z.string(),
  price: z.string(),
});

export type CreateVerificationRequestInput = z.infer<typeof CreateVerificationRequestInputSchema>;

/**
 * Creates a new payment verification request document in the 'payment_verifications' collection.
 * This is triggered when a user clicks "I Have Paid" in the payment dialog.
 * @param data The details of the purchase to be verified.
 */
export async function createVerificationRequest(data: CreateVerificationRequestInput): Promise<void> {
    const parsedData = CreateVerificationRequestInputSchema.safeParse(data);
    if (!parsedData.success) {
        throw new Error('Invalid verification request data.');
    }

    try {
        // Fetch user details on the server-side to ensure data integrity
        const userRef = doc(db, 'users', parsedData.data.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User submitting payment not found in database.");
        }
        
        const userData = userSnap.data();

        await addDoc(collection(db, 'payment_verifications'), {
            uid: parsedData.data.uid,
            email: userData.email || 'No email on record',
            displayName: userData.displayName || 'No name on record',
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
