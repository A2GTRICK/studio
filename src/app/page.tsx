import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Bot, FileQuestion, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: 'Note Management',
      description: 'Display and manage notes with options for premium content.',
    },
    {
      icon: <Bot className="h-10 w-10 text-primary" />,
      title: 'AI Note Generation',
      description: 'Generate structured Markdown notes from course, subject, and topic inputs.',
    },
    {
      icon: <FileQuestion className="h-10 w-10 text-primary" />,
      title: 'AI Quiz Generation',
      description: 'Automatically create quizzes from your notes to test your knowledge.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="font-headline text-2xl font-bold text-primary">phamA2G</h1>
          </div>
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-4xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl">
              Supercharge Your Studies with AI
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-muted-foreground md:text-xl">
              phamA2G is your all-in-one platform for intelligent note-taking and automated quiz generation. Focus on learning, we'll handle the rest.
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
        </section>

        <section className="bg-secondary/50 py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h3 className="font-headline text-3xl font-bold">An Unfair Advantage for Students</h3>
              <p className="text-muted-foreground">Everything you need to excel in your studies.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="flex flex-col items-center p-6 text-center shadow-lg transition-transform hover:scale-105">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="font-headline mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
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
