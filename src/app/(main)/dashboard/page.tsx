import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BrainCircuit, GraduationCap, CheckCircle2, Target, NotebookPen, Gem } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

const weeklyGoals = [
  { text: "Read 2 free notes", icon: BookOpen, href: "/notes", completed: true },
  { text: "Generate 1 set of AI Notes", icon: BrainCircuit, href: "/ai-notes", completed: false, isPremium: true },
  { text: "Generate 1 set of Exam Questions", icon: NotebookPen, href: "/exam-questions", completed: false, isPremium: true },
];


export default function DashboardPage() {
  const completedGoals = weeklyGoals.filter(goal => goal.completed).length;
  const progress = (completedGoals / weeklyGoals.length) * 100;

  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Welcome to A2G Smart Notes</h1>
            <p className="mt-4 text-lg text-muted-foreground">Your comprehensive toolkit for academic excellence in pharmacy. Explore our resources and supercharge your studies.</p>
            <Button asChild className="mt-6">
                <Link href="/notes">Start Exploring <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="hidden md:block">
            <Image src="https://placehold.co/300x200.png" alt="Pharmacy student studying" width={300} height={200} className="rounded-lg shadow-md" data-ai-hint="student studying" />
          </div>
        </div>
      </section>
      
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                 <h2 className="text-2xl font-headline font-semibold mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline"><BookOpen className="text-primary"/> Notes Library</CardTitle>
                      <CardDescription>Browse our extensive collection of curated study notes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline">
                        <Link href="/notes">Explore Notes <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline"><BrainCircuit className="text-primary"/> AI Tools</CardTitle>
                      <CardDescription>Generate notes and exam questions with our smart AI assistants.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline">
                        <Link href="/ai-notes">Use AI Tools <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:border-primary transition-colors">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline"><GraduationCap className="text-primary"/> Academic Services</CardTitle>
                      <CardDescription>Get expert help with your academic projects and writing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline">
                        <Link href="/services">View Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>

                   <Card className="hover:border-primary transition-colors bg-primary/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline"><Gem className="text-primary"/> Go Premium</CardTitle>
                      <CardDescription>Unlock all features and get unlimited access to AI tools.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild>
                        <Link href="/premium">Upgrade Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
            </div>

            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Target className="text-primary" /> Your Weekly Goal</CardTitle>
                    <CardDescription>Complete these tasks to get the most out of A2G Notes!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Progress</span>
                        <Progress value={progress} className="w-full" />
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <ul className="space-y-3">
                        {weeklyGoals.map((goal, index) => (
                            <li key={index} className="flex items-center gap-3">
                                <CheckCircle2 className={`h-5 w-5 ${goal.completed ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                                <span className={`flex-grow ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>{goal.text}</span>
                                {!goal.completed && (
                                    <Button asChild size="sm" variant={goal.isPremium ? "default" : "outline"}>
                                        <Link href={goal.href}>
                                          {goal.isPremium ? <Gem className="mr-2 h-4 w-4" /> : null}
                                          Start
                                        </Link>
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </section>
    </div>
  );
}
