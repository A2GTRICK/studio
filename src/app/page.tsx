import { Button } from '@/components/ui/button';
import { BookOpen, BrainCircuit, GraduationCap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-headline font-bold text-primary">A2G Smart Notes</h1>
        <Button asChild>
          <Link href="/dashboard">Enter App</Link>
        </Button>
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
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2" />
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
      </main>

      <footer className="bg-card py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} A2G Smart Notes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
