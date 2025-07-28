
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, BrainCircuit, GraduationCap, ArrowRight, CheckCircle2, LogIn, LineChart, NotebookPen, Youtube, Send, Globe, MessageSquare, Loader2, FileText, BookCopy, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { subscribeToNewsletter } from '@/services/newsletter-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { AiImage } from '@/components/ai-image';

const socialLinks = [
    { name: 'Website', href: 'https://a2gtricks.wordpress.com', icon: Globe },
    { name: 'YouTube', href: 'https://youtube.com/@a2g_tricks?si=_Ocd7GZHI39TUhof', icon: Youtube },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029VafwdunEKyZOy2acO41A', icon: MessageSquare },
    { name: 'Telegram', href: 'https://t.me/a2gtrickacademy', icon: Send },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive",
      });
      return;
    }
    setIsSubscribing(true);
    try {
      const result = await subscribeToNewsletter({ email });
      toast({
        title: "Success!",
        description: result.message,
      });

      // Trigger the download
      if (result.downloadLink) {
        window.open(result.downloadLink, '_blank');
      }

      setEmail('');

    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const renderAuthButton = () => {
    if (loading) {
      return <Skeleton className="h-10 w-28" />;
    }
    if (user) {
      return (
        <Button asChild>
          <Link href="/dashboard">
            Go to App <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      );
    }
    return (
      <Button asChild>
        <Link href="/login">
          Login / Sign Up <LogIn className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2" aria-label="A2G Smart Notes Home">
          <Image src="/assets/a2g-logo.svg" alt="A2G Smart Notes Logo" width={40} height={40} className="h-8 w-8 sm:h-10 sm:w-10" />
          <span className="text-xl sm:text-2xl font-headline font-bold text-primary">A2G Smart Notes</span>
        </Link>
         <div className="flex items-center gap-4">
            {renderAuthButton()}
        </div>
      </header>

      <main className="flex-grow">
        <section className="text-center pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl lg:text-6xl font-headline font-extrabold tracking-tight">
              Your Digital Partner for Pharmacy Success
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground">
              High-quality notes, AI-powered learning tools, and expert academic services, all in one place.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild>
                <Link href={user ? "/dashboard" : "/login"}>
                  Get Started for Free <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="pb-20 lg:pb-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
                    <div className="flex flex-col items-center">
                        <BrainCircuit className="h-8 w-8 text-primary mb-2" />
                        <h4 className="font-semibold">AI-Powered Insights</h4>
                        <p className="text-sm text-muted-foreground">Personalized study suggestions.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <BookOpen className="h-8 w-8 text-primary mb-2" />
                        <h4 className="font-semibold">Structured Notes</h4>
                        <p className="text-sm text-muted-foreground">Covering the entire syllabus.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <NotebookPen className="h-8 w-8 text-primary mb-2" />
                        <h4 className="font-semibold">Exam Prep Tools</h4>
                        <p className="text-sm text-muted-foreground">Generate high-yield questions.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <LineChart className="h-8 w-8 text-primary mb-2" />
                        <h4 className="font-semibold">Progress Tracking</h4>
                        <p className="text-sm text-muted-foreground">Visualize your learning journey.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-card py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-headline font-bold">About Us</h2>
                        <h3 className="text-xl font-semibold text-primary mt-2">Empowering Pharmacy Students Through Smart Learning</h3>
                        <p className="mt-4 text-muted-foreground">
                          A2G Smart Notes is a digital learning initiative by Arvind Sharma, founder of A2GTRICK Academy, built with a clear mission — to make pharmacy education more accessible, smarter, and future-ready.
                        </p>
                        <p className="mt-4 text-muted-foreground">
                          We believe that every pharmacy student, regardless of location or background, deserves access to high-quality, affordable, and easy-to-understand learning resources. Our goal is to eliminate the barriers of traditional learning by combining technology, expert knowledge, and student-centric content.
                        </p>
                         <blockquote className="mt-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
                          “We’re not just a notes provider – we’re your academic partner, helping you grow smarter, every day.”
                        </blockquote>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="relative w-[300px] h-[300px] flex items-center justify-center rounded-full shadow-lg bg-gradient-to-br from-background to-primary/10">
                            <Image src="/assets/a2g-logo.svg" alt="A2G Smart Notes Logo" width={200} height={200} className="p-4" />
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 mt-16">
                    <div>
                        <h3 className="text-2xl font-headline font-bold mb-4">🚀 What We Do</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Provide professionally curated notes for D.Pharm, B.Pharm, and exam-based learning</span></li>
                            <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Offer AI-powered tools to simplify complex pharmaceutical concepts</span></li>
                            <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Deliver exam-focused MCQs, tricks, and quick revision series</span></li>
                            <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Support students with project help, law & ethics notes, podcasts, and more</span></li>
                            <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Keep students updated with pharma jobs, government vacancies, and walk-in alerts</span></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-2xl font-headline font-bold mb-4">🌟 Why Choose A2G Smart Notes?</h3>
                        <ul className="space-y-3">
                           <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Built for pharmacy students, by a pharmacy educator</span></li>
                           <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Content aligned with BTEUP, PCI, and competitive exam standards</span></li>
                           <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>Trusted by thousands of learners on YouTube, Telegram, and WhatsApp</span></li>
                           <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" /><span>A blend of technology + education to help you succeed in both academics and career</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-muted/30 py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-headline font-bold text-center mb-12">Our Core Pillars</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline text-2xl mt-4">The Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">Comprehensive, curated notes for D.Pharm & B.Pharm. Structured for easy navigation and quick access.</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BrainCircuit className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline text-2xl mt-4">The Tutor</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">Intelligent AI tools to generate custom notes and predict exam questions, providing a personalized learning experience.</CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-headline text-2xl mt-4">The Mentor</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">Expert academic and project support for dissertations, reports, and more, guiding you to success.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-headline font-bold">Expert Academic Support When You Need It Most</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-muted-foreground">
                        From complex dissertations to professional resumes, our academic services are designed to help you overcome hurdles and achieve your goals. Let our experts guide you.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto">
                    <Card className="bg-card text-center">
                        <CardContent className="p-8">
                            <FileText className="h-10 w-10 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-headline font-semibold">Internship Reports</h3>
                            <p className="text-muted-foreground mt-2">Professionally crafted reports that meet academic standards.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card text-center">
                        <CardContent className="p-8">
                            <BookCopy className="h-10 w-10 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-headline font-semibold">Dissertation Support</h3>
                            <p className="text-muted-foreground mt-2">End-to-end guidance for your M.Pharm research projects.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card text-center">
                        <CardContent className="p-8">
                            <User className="h-10 w-10 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-headline font-semibold">Resume/SOP Crafting</h3>
                            <p className="text-muted-foreground mt-2">Stand out to recruiters and universities with a powerful profile.</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="text-center mt-12">
                    <Button size="lg" asChild>
                        <Link href="/services">
                            Explore All Services <ArrowRight className="ml-2 h-4 w-4"/>
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        <section className="bg-card py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-headline font-bold">Don't Just Study, Study Smarter</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Join thousands of students who trust A2G Smart Notes. Hear what they have to say.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <Card className="bg-background">
                        <CardContent className="p-6">
                            <p className="text-muted-foreground italic">"The AI question generator is a lifesaver! It helped me focus on the most important topics for my exams."</p>
                            <div className="flex items-center gap-4 mt-4">
                                <AiImage data-ai-hint="indian female student" alt="User avatar" width={40} height={40} className="rounded-full object-cover" />
                                <div>
                                    <p className="font-semibold">Priya S.</p>
                                    <p className="text-sm text-muted-foreground">B.Pharm, 2nd Year</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background">
                        <CardContent className="p-6">
                            <p className="text-muted-foreground italic">"Finally, all my notes in one place. The library is incredibly well-organized. A must-have for any pharmacy student."</p>
                            <div className="flex items-center gap-4 mt-4">
                                <AiImage data-ai-hint="indian male student" alt="User avatar" width={40} height={40} className="rounded-full object-cover" />
                                <div>
                                    <p className="font-semibold">Rahul K.</p>
                                    <p className="text-sm text-muted-foreground">D.Pharm, 1st Year</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-background">
                        <CardContent className="p-6">
                            <p className="text-muted-foreground italic">"The premium subscription is worth every rupee. The detailed notes and follow-up question feature gave me the confidence I needed."</p>
                             <div className="flex items-center gap-4 mt-4">
                                <AiImage data-ai-hint="smiling indian woman" alt="User avatar" width={40} height={40} className="rounded-full object-cover" />
                                <div>
                                    <p className="font-semibold">Anjali M.</p>
                                    <p className="text-sm text-muted-foreground">B.Pharm, 3rd Year</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <section className="bg-primary/10 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-headline font-bold text-primary">Join Our Newsletter</h2>
              <p className="mt-2 text-muted-foreground text-lg">Subscribe to get the latest updates on jobs, exams, and new notes.</p>
            </div>
            <div className="flex-1 w-full">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto md:mx-0">
                    <Input 
                      type="email"
                      placeholder="Enter your email address"
                      className="flex-grow bg-background"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubscribing}
                    />
                    <Button size="lg" type="submit" disabled={isSubscribing}>
                      {isSubscribing ? (
                          <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                      ) : (
                          <Send className="mr-2 h-5 w-5"/>
                      )}
                      {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                </form>
               <p className="text-sm text-muted-foreground mt-2 text-center md:text-left">We respect your privacy. No spam.</p>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-card py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
           <div className="mb-4">
                <h3 className="text-lg font-headline font-semibold text-foreground">Join Our Community</h3>
                <div className="flex justify-center gap-4 mt-2">
                    {socialLinks.map((link) => (
                        <Button key={link.name} variant="ghost" size="icon" asChild>
                            <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.name}>
                                <link.icon className="h-5 w-5" />
                            </a>
                        </Button>
                    ))}
                </div>
           </div>
          <p>&copy; {new Date().getFullYear()} A2G Smart Notes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

