
'use server';

import { z } from 'zod';

const quoteRequestSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  message: z.string(),
  serviceTitle: z.string(),
});

/**
 * Handles the submission of a quote request form.
 * In a real application, this would use a service like Resend or Nodemailer
 * to send an email notification. For this prototype, it logs the data to the console.
 */
export async function handleQuoteRequest(data: unknown) {
  const parsedData = quoteRequestSchema.safeParse(data);

  if (!parsedData.success) {
    console.error('Invalid quote request data:', parsedData.error);
    return { success: false, error: 'Invalid data provided.' };
  }

  const { name, email, message, serviceTitle } = parsedData.data;

  // In a real-world scenario, you would integrate an email sending service here.
  // For example, using Resend:
  //
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'quote-requests@yourdomain.com',
  //   to: 'a2gtrickacademy@gmail.com',
  //   subject: `New Quote Request for: ${serviceTitle}`,
  //   html: `
  //     <h1>New Quote Request</h1>
  //     <p><strong>Service:</strong> ${serviceTitle}</p>
  //     <p><strong>Name:</strong> ${name}</p>
  //     <p><strong>Email:</strong> ${email}</p>
  //     <hr>
  //     <h2>Message:</h2>
  //     <p>${message.replace(/\n/g, '<br>')}</p>
  //   `,
  // });

  console.log('--- NEW QUOTE REQUEST (SIMULATED EMAIL) ---');
  console.log(`Service: ${serviceTitle}`);
  console.log(`From: ${name} <${email}>`);
  console.log(`Message: ${message}`);
  console.log('-------------------------------------------');

  return { success: true };
}
