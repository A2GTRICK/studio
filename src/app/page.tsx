
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AnimatedHeroIcon from '@/components/animated-hero-icon';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: "AI Note Generator",
    description: "Generate comprehensive, syllabus-aligned notes on any topic in seconds.",
    image: {
      src: "https://picsum.photos/seed/notes/600/400",
      width: 600,
      height: 400,
      aiHint: "notebook study"
    }
  },
  {
    title: "Exam-Ready Quizzes",
    description: "Create customized MCQs for GPAT, NIPER, and other exams to test your knowledge.",
    image: {
      src: "https://picsum.photos/seed/quiz/600/400",
      width: 600,
      height: 400,
      aiHint: "exam test"
    }
  },
  {
    title: "Curated Content Library",
    description: "Access a library of expert-verified notes and practice sets for all your subjects.",
    image: {
      src: "https://picsum_photos/seed/library/600/400",
      width: 600,
      height: 400,
      aiHint: "books library"
    }
  }
];

export default function Home() {
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
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left">
                    <h2 className="font-headline text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl">
                    Supercharge Your Pharmacy Padhai with AI
                    </h2>
                    <p className="mt-4 max-w-[600px] text-lg text-muted-foreground md:text-xl">
                    Your smart friend for pharmacy exams and studies. Focus on learning, and we'll handle the rest. Ab padhai hogi smart!
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

        <section className="py-12 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h3 className="font-headline text-3xl font-bold">Your Ultimate Pharmacy Toolkit</h3>
              <p className="mt-2 text-lg text-muted-foreground max-w-3xl mx-auto">
                Everything you need to excel in your pharmacy curriculum and competitive exams, all in one place.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="p-0">
                    <Image 
                      src={feature.image.src} 
                      alt={feature.title} 
                      width={feature.image.width} 
                      height={feature.image.height} 
                      className="w-full h-48 object-cover" 
                      data-ai-hint={feature.image.aiHint}
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="font-headline text-xl mb-2">{feature.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-secondary/50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md text-center">
            <h4 className="font-headline text-2xl font-bold">Subscribe to Our Newsletter</h4>
            <p className="mt-2 text-muted-foreground">Stay up to date with the latest features and offers.</p>
            <form className="mt-4 flex gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button type="submit" variant="default">Subscribe</Button>
            </form>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} phamA2G. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
