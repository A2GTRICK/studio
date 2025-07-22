
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { handleQuoteRequest } from '@/app/actions';
import { DialogClose } from './ui/dialog';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
  serviceTitle: z.string(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
    serviceTitle: string;
    defaultMessage: string;
}

export function ContactForm({ serviceTitle, defaultMessage }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: defaultMessage,
      serviceTitle: serviceTitle,
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const result = await handleQuoteRequest(data);
      if (result.success) {
        toast({
          title: 'Quote Request Sent!',
          description: "Thank you for your interest. We'll be in touch soon.",
        });
        form.reset();
        // Manually close the dialog by finding and clicking the close button
        // This is a common pattern when you can't pass `setIsOpen` down.
        document.querySelector('[data-radix-collection-item] > [aria-label="Close"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Your Name</FormLabel>
            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Your Email</FormLabel>
            <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
            <FormLabel>Your Message</FormLabel>
            <FormControl><Textarea rows={8} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="serviceTitle" render={({ field }) => (
            <Input type="hidden" {...field} />
        )} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Sending...' : 'Send Request'}
        </Button>
      </form>
    </Form>
  );
}
