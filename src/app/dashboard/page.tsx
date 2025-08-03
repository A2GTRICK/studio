import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, FileQuestion, BookOpen, ArrowRight, BookText } from 'lucide-react';
import Link from 'next/link';

const primaryFeatures = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI Note Generator',
    description:
      'Instantly create detailed notes on any topic. Just provide the subject and let our AI do the work.',
    link: '/dashboard/ai-note-generator',
    cta: 'Generate Note',
  },
  {
    icon: <FileQuestion className="h-8 w-8 text-primary" />,
    title: 'AI Quiz Generator',
    description:
      'Turn your notes into practice quizzes to master your subjects and prepare for exams effortlessly.',
    link: '/dashboard/ai-quiz-generator',
    cta: 'Create Quiz',
  },
];

const secondaryFeatures = [
    {
    icon: <BookText className="h-8 w-8 text-primary" />,
    title: "AI Document Summarizer",
    description: "Summarize long documents into concise, easy-to-digest points, saving you time and effort.",
    link: "/dashboard/ai-document-summarizer",
    cta: "Summarize Document",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Welcome back, Alex!
        </h2>
        <p className="text-muted-foreground">
          Ready to dive in? Here's what you can do today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Features Column */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {primaryFeatures.map((feature) => (
             <Card key={feature.title} className="flex flex-col shadow-md transition-transform hover:scale-[1.02]">
             <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
               {feature.icon}
               <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
             </CardHeader>
             <CardContent className="flex-grow">
               <CardDescription>{feature.description}</CardDescription>
             </CardContent>
             <CardFooter>
               <Button asChild className="w-full">
                 <Link href={feature.link}>
                   {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                 </Link>
               </Button>
             </CardFooter>
           </Card>
          ))}
           <div className="md:col-span-2">
                 <Card className="shadow-md transition-transform hover:scale-[1.02]">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                        <BookText className="h-8 w-8 text-primary" />
                        <CardTitle className="font-headline text-xl">AI Document Summarizer</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <CardDescription>Summarize long documents into concise, easy-to-digest points, saving you time and effort.</CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/dashboard/ai-document-summarizer">
                            Summarize Document <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
           </div>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-1">
          <Card className="shadow-md h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <CardTitle className="font-headline text-xl">My Notes</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <CardDescription>
                Access, edit, and organize all your generated notes in one place.
              </CardDescription>
              <div className="space-y-3 pt-2">
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-sm">Notes on The Cold War</p>
                        <p className="text-xs text-muted-foreground">Generated yesterday</p>
                    </div>
                    <Button variant="outline" size="sm" asChild><Link href="/dashboard/notes">View</Link></Button>
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-sm">Quiz on Quantum Mechanics</p>
                        <p className="text-xs text-muted-foreground">Generated 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm" asChild><Link href="/dashboard/notes">View</Link></Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard/notes">
                  View All Notes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
