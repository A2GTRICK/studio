
'use server';

import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  service: z.string(),
});

export type ContactFormState = {
  success: boolean;
  message: string;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const service = formData.get('service') as string;

  const validatedFields = contactSchema.safeParse({
    name,
    email,
    message,
    service,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data. Please check your entries.',
    };
  }

  try {
    // In a real application, you would integrate an email sending service here
    // like Resend, SendGrid, or Nodemailer.
    // For now, we will just log the data to the server console to demonstrate
    // that the lead has been successfully and reliably captured.

    console.log('--- NEW SERVICE LEAD CAPTURED ---');
    console.log('Service:', validatedFields.data.service);
    console.log('Name:', validatedFields.data.name);
    console.log('Email:', validatedFields.data.email);
    console.log('Message:', validatedFields.data.message);
    console.log('---------------------------------');

    return {
      success: true,
      message: 'Thank you for your request! We have received it and will get back to you shortly.',
    };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return {
      success: false,
      message: 'Something went wrong on our end. Please try again later.',
    };
  }
}
