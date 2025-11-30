
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Layers, GraduationCap, CheckCircle2, Youtube, Send, Globe } from 'lucide-react';
import Link from 'next/link';
import AnimatedHeroIcon from '@/components/animated-hero-icon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { SVGProps } from 'react';

const features = [
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: 'Expert Notes',
    description: 'High-quality, syllabus-aligned notes for D.Pharm & B.Pharm.',
  },
  {
    icon: <Layers className="h-8 w-8 text-primary" />,
    title: 'AI-Powered MCQs',
    description: 'Practice for GPAT, NIPER, and other exams with AI-generated quizzes.',
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-primary" />,
    title: 'Academic Services',
    description: 'Get help with projects, reports, dissertations, and more.',
  },
];

const faqData = [
    {
        question: "What is phamA2G?",
        answer: "phamA2G is a digital learning platform for pharmacy students, providing high-quality notes, AI-powered study tools, exam preparation materials, and academic support services."
    },
    {
        question: "Is there a free plan?",
        answer: "Yes! You can get started for free to access a wide range of notes and generate a limited number of AI quizzes and notes per day. You can explore our core features without any commitment."
    },
    {
        question: "Who is this platform for?",
        answer: "Our platform is designed for D.Pharm, B.Pharm, and M.Pharm students, as well as those preparing for competitive exams like GPAT, NIPER, and Drug Inspector tests."
    }
];

const WhatsAppIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.849 6.069l-1.104 4.053 4.144-1.088z"/>
    </svg>
);

const socialLinks = [
    { name: 'YouTube', href: 'https://youtube.com/@a2g_tricks?si=_Ocd7GZHI39TUhof', icon: Youtube, isPrimary: true },
    { name: 'Telegram', href: 'https://t.me/a2gtrickacademy', icon: Send },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029VafwdunEKyZOy2acO41A', icon: WhatsAppIcon },
    { name: 'Website', href: 'https://a2gtricks.wordpress.com', icon: Globe },
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
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                    <h2 className="font-headline text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl">
                    Supercharge Your Pharmacy Padhai with phamA2G
                    </h2>
                    <p className="mt-4 max-w-[600px] mx-auto lg:mx-0 text-lg text-muted-foreground md:text-xl">
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

        {/* Why Choose Us Section */}
        <section className="py-12 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="font-headline text-3xl font-bold">Why Choose phamA2G?</h3>
              <p className="mt-2 text-muted-foreground">We blend expert knowledge with AI to create a powerful, personalized learning experience.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 bg-white rounded-xl shadow-lg border border-primary/10 text-center flex flex-col items-center">
                  <div className="p-3 bg-primary/10 rounded-full mb-4">{feature.icon}</div>
                  <h4 className="font-headline text-xl font-semibold">{feature.title}</h4>
                  <p className="mt-2 text-muted-foreground text-sm flex-grow">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Core Offerings Section */}
        <section className="py-12 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h3 className="font-headline text-3xl font-bold">Our Core Offerings</h3>
                    <p className="mt-2 text-muted-foreground">Everything you need to excel in your pharmacy studies, all in one place.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Link href="/dashboard/notes" className="block p-6 bg-white rounded-xl shadow-lg border border-primary/10 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex items-center gap-4 mb-3">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <h4 className="font-headline text-xl font-semibold">Notes Library</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Access a vast library of syllabus-aligned notes for D.Pharm and B.Pharm, curated by experts.</p>
                    </Link>
                    <Link href="/dashboard/ai-quiz-generator" className="block p-6 bg-white rounded-xl shadow-lg border border-primary/10 transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="flex items-center gap-4 mb-3">
                            <Layers className="h-6 w-6 text-primary" />
                            <h4 className="font-headline text-xl font-semibold">AI Quiz Generator</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Generate unlimited MCQs for any topic and difficulty level to master concepts for competitive exams.</p>
                    </Link>
                     <Link href="/dashboard/services" className="block p-6 bg-white rounded-xl shadow-lg border border-primary/10 transition-all hover:shadow-2xl hover:-translate-y-1">
                         <div className="flex items-center gap-4 mb-3">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <h4 className="font-headline text-xl font-semibold">Academic Services</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Get expert assistance with project files, internship reports, dissertations, and more.</p>
                    </Link>
                </div>
            </div>
        </section>

        {/* Meet Your Mentor Section */}
        <section className="py-12 md:py-24 bg-secondary/50">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <h3 className="font-headline text-3xl font-bold">Meet Your Mentor</h3>
                        <h4 className="text-xl font-semibold text-primary mt-2">Arvind Sharma, Founder of A2GTRICK Academy</h4>
                        <p className="mt-4 text-muted-foreground">
                          With years of experience in pharmacy education and a passion for helping students succeed, Arvind Sharma created phamA2G to make learning simpler, smarter, and more accessible for every pharmacy student in India.
                        </p>
                        <blockquote className="mt-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
                          “My mission is to provide the tools and guidance you need to not just pass your exams, but to build a successful career in pharmacy.”
                        </blockquote>
                    </div>
                    <div className="flex justify-center items-center">
                       <Image src="https://i.postimg.cc/k5CkkR0S/image-logo.png" alt="Arvind Sharma" width={200} height={200} className="w-48 h-48 rounded-full object-cover drop-shadow-xl border-4 border-white" />
                    </div>
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-24">
            <div className="container mx-auto px-4 max-w-3xl">
                 <div className="text-center">
                    <h3 className="font-headline text-3xl font-bold">Frequently Asked Questions</h3>
                </div>
                <div className="mt-8">
                     <Accordion type="single" collapsible className="w-full">
                        {faqData.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg shadow-sm mb-4 px-4 border">
                                <AccordionTrigger className="text-left font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-secondary/50 py-12 border-t">
        <div className="container mx-auto px-4 text-center">
            <h4 className="font-headline text-2xl font-bold">Stay Connected & Join Our Community</h4>
             <p className="mt-2 text-muted-foreground max-w-xl mx-auto">Get updates on new notes, study resources, and important exam alerts.</p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" asChild>
                    <a href={mailtoLink}>
                        Join Us
                    </a>
                </Button>
            </div>
             <div className="mt-8 flex justify-center flex-wrap gap-4">
                {socialLinks.map((link) => (
                    <Button key={link.name} variant={link.isPrimary ? "default" : "outline"} asChild>
                        <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                            <link.icon className="mr-2 h-4 w-4" />
                            <span>{link.name}</span>
                        </a>
                    </Button>
                ))}
            </div>

            <div className="relative mt-12 w-full overflow-hidden">
                <div className="flex animate-marquee">
                    <div className="flex w-full justify-around">
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">GPAT 2025</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">NIPER JEE</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">Drug Inspector</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">Pharmacist Exams</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">D.Pharm & B.Pharm</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">Free Notes</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">AI MCQs</span>
                    </div>
                     <div className="flex w-full justify-around" aria-hidden="true">
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">GPAT 2025</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">NIPER JEE</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">Drug Inspector</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">Pharmacist Exams</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">D.Pharm & B.Pharm</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">Free Notes</span>
                        <span className="text-lg font-semibold text-muted-foreground/80 mx-4">AI MCQs</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} phamA2G. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
