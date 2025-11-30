'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2, Youtube, Send, Globe } from 'lucide-react';
import Link from 'next/link';
import AnimatedHeroIcon from '@/components/animated-hero-icon';
import { useState, SVGProps } from 'react';
import { useToast } from '@/hooks/use-toast';


const WhatsAppIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.849 6.069l-1.104 4.053 4.144-1.088z"/>
    </svg>
);

const socialLinks = [
    { name: 'YouTube', href: 'https://youtube.com/@a2g_tricks?si=_Ocd7GZHI39TUhof', icon: Youtube, variant: 'default' },
    { name: 'Telegram', href: 'https://t.me/a2gtrickacademy', icon: Send, variant: 'outline' },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029VafwdunEKyZOy2acO41A', icon: WhatsAppIcon, variant: 'outline' },
    { name: 'Website', href: 'https://a2gtricks.wordpress.com', icon: Globe, variant: 'outline' },
] as const;

const floatingTags = [
  { text: 'GPAT 2025', style: { top: '15%', left: '5%', animationDelay: '0s' } },
  { text: 'B.Pharm', style: { top: '20%', right: '10%', animationDelay: '2s' } },
  { text: 'D.Pharm Notes', style: { bottom: '15%', right: '20%', animationDelay: '6s' } },
  { text: 'Human Anatomy', style: { top: '5%', right: '40%', animationDelay: '7s' } },
  { text: 'Medicinal Chemistry', style: { top: '70%', right: '5%', animationDelay: '1s' } },
   { text: 'Pharmacognosy', style: { bottom: '5%', left: '30%', animationDelay: '5s' } },
];

export default function Home() {

  const mailtoLink = "mailto:a2gtrickacademy@gmail.com?subject=Subscribe%20to%20phamA2G%20Newsletter&body=Please%20add%20me%20to%20your%20mailing%20list!";

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
            <div className="grid gap-12 md:grid-cols-2">

                <div className="text-center md:text-left">
                    <h4 className="font-headline text-2xl font-bold">📬 Stay Connected</h4>
                    <p className="mt-2 text-muted-foreground">Get updates on new notes, study resources, and important exam alerts.</p>
                    <div className="mt-4">
                        <Button asChild size="lg">
                            <a href={mailtoLink}>
                                Join Us
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="text-center md:text-left">
                     <h4 className="font-headline text-2xl font-bold">🤝 Join Our Community</h4>
                     <p className="mt-2 text-muted-foreground">Connect with fellow pharmacy students and stay updated on our channels.</p>
                    <div className="mt-4 flex justify-center md:justify-start flex-wrap gap-3">
                        {socialLinks.map((link) => (
                            <Button key={link.name} variant={link.variant} asChild>
                                <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                                    <link.icon className="mr-2 h-4 w-4" />
                                    <span>{link.name}</span>
                                </a>
                            </Button>
                        ))}
                    </div>
                </div>

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
