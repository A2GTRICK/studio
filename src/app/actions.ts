
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  service: z.string(),
});

export type InquiryState = {
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
  };
  message?: string | null;
  success?: boolean;
};

export async function submitInquiry(prevState: InquiryState, formData: FormData): Promise<InquiryState> {
  const validatedFields = inquirySchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
    service: formData.get('service'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to submit inquiry. Please check the form for errors.',
      success: false,
    };
  }

  const { name, email, message, service } = validatedFields.data;

  try {
    const docRef = await addDoc(collection(db, 'service_inquiries'), {
      name,
      email,
      message,
      service,
      submittedAt: serverTimestamp(),
      status: 'new', // Default status for new inquiries
    });
    console.log('Inquiry saved with ID: ', docRef.id);
    return { message: 'Your inquiry has been submitted successfully! We will get back to you soon.', success: true };
  } catch (error) {
    console.error('Error saving inquiry to Firestore:', error);
    return { message: 'An internal error occurred. Please try again later.', success: false };
  }
}
