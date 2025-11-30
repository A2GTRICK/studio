
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles, Target, BookCheck } from 'lucide-react';
import Link from 'next/link';
import AnimatedHeroIcon from '@/components/animated-hero-icon';

const features = [
  {
    icon: <Sparkles className="h-8 w-8 text-white" />,
    title: "AI Note Generator",
    description: "Generate comprehensive, syllabus-aligned notes on any topic in seconds. Save time and study smarter.",
    bgColor: "bg-purple-600",
  },
  {
    icon: <Target className="h-8 w-8 text-white" />,
    title: "Exam-Ready Quizzes",
    description: "Create customized MCQs for GPAT, NIPER, and other exams. Test your knowledge and track your progress.",
    bgColor: "bg-blue-600",
  },
  {
    icon: <BookCheck className="h-8 w-8 text-white" />,
    title: "Curated Content",
    description: "Access a library of expert-verified notes and practice sets, ensuring you study from the best resources.",
    bgColor: "bg-green-600",
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${feature.bgColor} mb-4`}>
                    {feature.icon}
                  </div>
                  <h4 className="font-headline text-xl font-bold mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
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
