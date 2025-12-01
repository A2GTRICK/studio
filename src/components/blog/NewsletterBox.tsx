'use client';
import { useState } from 'react';
import { Mail } from 'lucide-react';

export default function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      // TODO: replace with your API endpoint
      // await fetch('/api/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
      await new Promise((res)=>setTimeout(res, 600)); // placeholder
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/10 text-primary rounded-full"><Mail className="h-5 w-5" /></div>
        <div>
          <h4 className="text-sm font-semibold">Subscribe to newsletter</h4>
          <p className="text-xs text-muted-foreground">Get the latest updates in your inbox.</p>
        </div>
      </div>
      <form onSubmit={subscribe} className="flex gap-2">
        <input
          placeholder="Your email"
          className="flex-1 input px-3 py-2 rounded-md border"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <button type="submit" className="btn btn-primary px-4" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      {status === 'success' && <p className="text-xs text-green-600 mt-2">Subscribed — check your inbox.</p>}
      {status === 'error' && <p className="text-xs text-destructive mt-2">Failed to subscribe. Try again later.</p>}
    </div>
  );
}
