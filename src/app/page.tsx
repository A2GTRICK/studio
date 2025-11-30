
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import AnimatedHeroIcon from '@/components/animated-hero-icon';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const floatingTags = [
  { text: 'GPAT 2025', style: { top: '10%', left: '15%', animationDelay: '0s' } },
  { text: 'B.Pharm', style: { top: '20%', right: '10%', animationDelay: '2s' } },
  { text: 'D.Pharm Notes', style: { bottom: '15%', right: '20%', animationDelay: '6s' } },
  { text: 'Human Anatomy', style: { top: '5%', right: '45%', animationDelay: '7s' } },
  { text: 'Medicinal Chemistry', style: { top: '70%', right: '5%', animationDelay: '1s' } },
  { text: 'Pharmacognosy', style: { bottom: '5%', left: '30%', animationDelay: '5s' } },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Successfully Subscribed!',
          description: "Thank you for joining. You'll get the latest updates.",
        });
        setEmail('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Subscription Failed',
          description: result.error || 'Something went wrong. Please try again.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="font-headline text-2xl font-bold text-primary">phamA2G</h1>
          </div>
          <nav className="flex items-center space-x-2">
             <Button asChild>
              <Link href="/dashboard">
                Enter Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative py-12 md:py-24 lg:py-32 overflow-hidden">
          {floatingTags.map(tag => (
            <div
              key={tag.text}
              className="absolute hidden lg:block animate-float rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm border border-primary/20"
              style={tag.style}
            >
              {tag.text}
            </div>
          ))}
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                    <h2 className="font-headline text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl">
                    Supercharge Your Pharmacy Padhai with phamA2G
                    </h2>
                    <p className="mt-4 max-w-[600px] text-lg text-muted-foreground md:text-xl">
                    Your smart friend for pharmacy exams and studies. Focus on learning, and we'll handle the rest. “अब पढ़ाई होगी आसान।
                    </p>
                    <div className="mt-8">
                    <Button size="lg" asChild>
                        <Link href="/dashboard">
                        Get Started for Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    </div>
                </div>
                <div className="w-full max-w-sm mx-auto lg:max-w-md h-auto aspect-square">
                    <AnimatedHeroIcon />
                </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-secondary/50 py-12 overflow-x-hidden">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md text-center">
            <h4 className="font-headline text-2xl font-bold">📬 Stay Connected</h4>
            <p className="mt-2 text-muted-foreground">Get updates on new notes, study resources, and important exam alerts.</p>
            <form onSubmit={handleSubscription} className="mt-4 flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Join Us'}
              </Button>
            </form>
          </div>
           <div className="mt-12 border-t pt-8">
            <div className="relative flex overflow-x-hidden">
              <div className="py-2 animate-marquee whitespace-nowrap flex">
                <span className="text-sm text-muted-foreground mx-4">Pharmacy Notes Library • MCQ Practice for All Levels • Study Material for B.Pharm & D.Pharm • Project Files, Reports & Academic Support • phamA2G</span>
                <span className="text-sm text-muted-foreground mx-4">Pharmacy Notes Library • MCQ Practice for All Levels • Study Material for B.Pharm & D.Pharm • Project Files, Reports & Academic Support • phamA2G</span>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} phamA2G. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
