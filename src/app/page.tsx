
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, BrainCircuit, GraduationCap, ArrowRight, Download, CheckCircle2, Bell, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { subscribeToNewsletter } from '@/ai/flows/subscribe-to-newsletter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
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
      setDownloadLink(result.downloadLink);
      toast({
        title: "Success!",
        description: "You're subscribed. Your download will begin shortly.",
      });
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
            <GraduationCap />
            A2G Smart Notes
        </Link>
         <div className="flex items-center gap-4">
            {loading ? null : user ? (
                <Button asChild>
                    <Link href="/dashboard">
                        Go to App <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            ) : (
                 <Button asChild>
                    <Link href="/login">
                        Login / Sign Up <LogIn className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            )}
        </div>
      </header>

      <main className="flex-grow">
        <section className="text-center py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl lg:text-6xl font-headline font-extrabold tracking-tight">
              Your Digital Partner for Pharmacy Success
            </h2>
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

        <section className="bg-card py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-headline font-bold text-center mb-12">Our Core Pillars</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-background rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-headline font-semibold mb-2">The Library</h4>
                <p className="text-muted-foreground">Comprehensive, curated notes for D.Pharm & B.Pharm. Structured for easy navigation and quick access.</p>
              </div>
              <div className="text-center p-6 bg-background rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-headline font-semibold mb-2">The Tutor</h4>
                <p className="text-muted-foreground">Intelligent AI tools to generate custom notes and predict exam questions, providing a personalized learning experience.</p>
              </div>
              <div className="text-center p-6 bg-background rounded-lg shadow-md transition-transform hover:scale-105">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-headline font-semibold mb-2">The Mentor</h4>
                <p className="text-muted-foreground">Expert academic and project support for dissertations, reports, and more, guiding you to success.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h3 className="text-3xl font-headline font-bold">Don't Just Study, Study Smarter</h3>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Join thousands of students who trust A2G Smart Notes. Hear what they have to say.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <Card className="bg-card">
                        <CardContent className="p-6">
                            <p className="text-muted-foreground italic">"The AI question generator is a lifesaver! It helped me focus on the most important topics for my exams."</p>
                            <div className="flex items-center gap-4 mt-4">
                                <Image src="https://placehold.co/40x40.png" alt="User avatar" width={40} height={40} className="rounded-full" data-ai-hint="person smiling"/>
                                <div>
                                    <p className="font-semibold">Priya S.</p>
                                    <p className="text-sm text-muted-foreground">B.Pharm, 2nd Year</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardContent className="p-6">
                            <p className="text-muted-foreground italic">"Finally, all my notes in one place. The library is incredibly well-organized. A must-have for any pharmacy student."</p>
                            <div className="flex items-center gap-4 mt-4">
                                <Image src="https://placehold.co/40x40.png" alt="User avatar" width={40} height={40} className="rounded-full" data-ai-hint="student portrait"/>
                                <div>
                                    <p className="font-semibold">Rahul K.</p>
                                    <p className="text-sm text-muted-foreground">D.Pharm, 1st Year</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card">
                        <CardContent className="p-6">
                            <p className="text-muted-foreground italic">"The premium subscription is worth every rupee. The detailed notes and follow-up question feature gave me the confidence I needed."</p>
                             <div className="flex items-center gap-4 mt-4">
                                <Image src="https://placehold.co/40x40.png" alt="User avatar" width={40} height={40} className="rounded-full" data-ai-hint="person thinking"/>
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
              <h3 className="text-3xl font-headline font-bold text-primary">Get a Head Start!</h3>
              <p className="mt-2 text-muted-foreground text-lg">Download our free "Top 20 Most Asked Pharmacology Questions" PDF and see the quality for yourself.</p>
            </div>
            <div className="flex-1 w-full">
               {downloadLink ? (
                 <div className="flex flex-col items-center justify-center text-center bg-background p-6 rounded-lg shadow-md max-w-md mx-auto md:mx-0">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                    <h4 className="text-xl font-headline font-bold">Thank you for subscribing!</h4>
                    <p className="text-muted-foreground mb-4">Your download is ready.</p>
                    <Button size="lg" asChild>
                      <a href={downloadLink} download="Top-20-Pharmacology-Questions.pdf">
                        <Download className="mr-2 h-5 w-5"/>
                        Download PDF
                      </a>
                    </Button>
                 </div>
               ) : (
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
                      <Download className="mr-2 h-5 w-5"/>
                      {isSubscribing ? 'Subscribing...' : 'Download Now'}
                    </Button>
                </form>
               )}
               <p className="text-sm text-muted-foreground mt-2 text-center md:text-left">We respect your privacy. No spam.</p>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-card py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} A2G Smart Notes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
