
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { submitContactForm, type ContactFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Label } from './ui/label';

interface ContactFormProps {
  serviceTitle: string;
  emailBody: string;
  onSuccess: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? 'Submitting...' : 'Send Request'}
    </Button>
  );
}

export function ContactForm({ serviceTitle, emailBody, onSuccess }: ContactFormProps) {
  const initialState: ContactFormState = { success: false, message: '' };
  const [state, formAction] = useFormState(submitContactForm, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? 'Success!' : 'Error',
        description: state.message,
        variant: state.success ? 'default' : 'destructive',
      });
      if (state.success) {
        onSuccess();
      }
    }
  }, [state, toast, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="service" value={serviceTitle} />
      <div>
        <Label htmlFor="name">Your Name</Label>
        <Input id="name" name="name" type="text" placeholder="e.g., Arvind Kumar" required />
      </div>
      <div>
        <Label htmlFor="email">Your Email</Label>
        <Input id="email" name="email" type="email" placeholder="e.g., you@example.com" required />
      </div>
      <div>
        <Label htmlFor="message">Your Request Details</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Please provide any details about your project..."
          rows={6}
          defaultValue={emailBody.split('\n\n')[1]} // Prefill with the helpful part of the email body
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
}
