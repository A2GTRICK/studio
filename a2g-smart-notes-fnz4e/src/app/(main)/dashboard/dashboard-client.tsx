
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BrainCircuit, NotebookPen, Gem, Users, AlertTriangle, RefreshCw, Target, BarChart3, Shield, GraduationCap, CheckSquare } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { GenerateDashboardInsightsOutput } from '@/ai/flows/generate-dashboard-insights';
import { generateDashboardInsights } from '@/ai/flows/generate-dashboard-insights';
import { getSubjectsProgress } from '@/services/user-progress-service';
import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { services } from '@/lib/services-data';

const AdminPanel = () => (
  <Card className="bg-primary/10 border-primary border-2 shadow-lg">
    <CardHeader>
      <CardTitle className="font-headline flex items-center gap-2 text-primary"><Shield /> Admin Dashboard</CardTitle>
      <CardDescription className="text-primary/80">This panel is only visible to you. Manage your application's content and settings here.</CardDescription>
    </CardHeader>
    <CardContent>
        <Button asChild className="w-full" size="lg">
            <Link href="/admin">Go to Admin Panel</Link>
        </Button>
    </CardContent>
  </Card>
);

const QuickActionsPanel = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Features Column */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="flex flex-col hover:shadow-lg transition-shadow">
                 <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <CheckSquare className="h-6 w-6"/>
                        </div>
                        <CardTitle className="font-headline text-2xl">MCQ Practice</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">Test your knowledge with AI-generated MCQs for competitive exams like GPAT & NIPER.</p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/mcq-practice">Start Quiz <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </CardFooter>
            </Card>
            <Card className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                   <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-primary/10 text-primary">
                            <BrainCircuit className="h-6 w-6"/>
                        </div>
                        <CardTitle className="font-headline text-2xl">AI Tools</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">Generate detailed notes on any topic or create high-probability exam questions.</p>
                </CardContent>
                 <CardFooter className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline"><Link href="/ai-notes">Notes</Link></Button>
                    <Button asChild variant="outline"><Link href="/exam-questions">Questions</Link></Button>
                </CardFooter>
            </Card>
             <Card className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 p-6 hover:shadow-lg transition-shadow">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <GraduationCap className="h-8 w-8"/>
                </div>
                <div className="flex-grow text-center sm:text-left">
                    <h3 className="font-headline text-2xl">Academic Services</h3>
                    <p className="text-muted-foreground mt-1">Get expert help with your internship reports, dissertations, and more.</p>
                </div>
                <Button asChild size="lg" className="shrink-0 w-full sm:w-auto">
                    <Link href="/services">View Services <ArrowRight className="ml-2 h-4 w-4"/></Link>
                </Button>
            </Card>
        </div>
        {/* Side Column */}
        <div className="space-y-6">
             <Card className="flex flex-col text-center items-center justify-center p-6 bg-primary/10 border-primary/20 hover:shadow-lg transition-shadow h-full">
                <Gem className="h-10 w-10 text-primary mb-3"/>
                <h3 className="font-headline text-2xl text-primary">Go Premium</h3>
                <p className="text-primary/80 mt-1 mb-4 flex-grow">Unlock all features, including unlimited AI usage and access to all premium notes.</p>
                <Button asChild className="w-full" variant="default" size="lg">
                    <Link href="/premium">Upgrade Now</Link>
                </Button>
            </Card>
        </div>
    </div>
);


const loadingMessages = [
    "Aapke academic record ka post-mortem kar rahe hain... 🧐",
    "AI se aapke liye study tips pooch rahe hain... 🤖",
    "Let's see... kitni padhai hui hai... 👀",
    "Generating insights faster than you can say 'pharmacology'!",
    "Analyzing your progress... this is the real exam! 😜"
];

const DashboardSkeleton = ({ message }: { message: string }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><div className="grid grid-cols-3 gap-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
             <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground animate-pulse">{message}</p>
                </CardContent>
             </Card>
             <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></CardContent></Card>
        </div>
    </div>
);


const SubjectProgress = ({ subjects }: { subjects: NonNullable<GenerateDashboardInsightsOutput['subjectsProgress']> }) => {

    if (!subjects || subjects.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Subject-wise Progress</CardTitle>
                <CardDescription>High-level overview of your study status.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="multiple" className="w-full space-y-4">
                    {subjects.slice(0, 3).map((subject, index) => {
                        const completed = subject.topics.filter(t => t.status === 'completed').length;
                        const total = subject.topics.length;
                        const progress = total > 0 ? (completed / total) * 100 : 0;
                        return (
                            <AccordionItem value={`item-${index}`} key={index} className="bg-background/50 border rounded-lg px-4">
                                <AccordionTrigger className="py-4 text-left hover:no-underline">
                                    <div className="w-full">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-semibold">{subject.subject}</p>
                                            <p className="text-sm text-muted-foreground">{completed} / {total} topics</p>
                                        </div>
                                        <Progress value={progress} />
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-4">
                                     <ul className="space-y-2 mt-2">
                                        {subject.topics.map((topic, topicIdx) => (
                                            <li key={topicIdx} className="flex justify-between items-center text-sm p-2 rounded-md bg-background">
                                                <span className="flex-1 pr-4">{topic.title}</span>
                                                <Badge variant={topic.status === 'completed' ? 'default' : 'secondary'} className={topic.status === 'completed' ? 'bg-green-600/80' : ''}>
                                                    {topic.status === 'completed' ? 'Completed' : 'Pending'}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </CardContent>
             <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/my-progress">
                        View Full Report
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};

const SummaryStats = ({ insights }: { insights: GenerateDashboardInsightsOutput }) => (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Academic Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-card-foreground/5 rounded-lg">
                <p className="text-3xl font-bold text-primary">{insights.totalProgress}%</p>
                <p className="text-xs text-muted-foreground">Syllabus Done</p>
            </div>
             <div className="p-2 bg-card-foreground/5 rounded-lg">
                <p className="text-3xl font-bold">{insights.subjectsCompleted}</p>
                <p className="text-xs text-muted-foreground">Subjects Done</p>
            </div>
             <div className="p-2 bg-card-foreground/5 rounded-lg">
                <p className="text-3xl font-bold">{insights.pendingTopics}</p>
                <p className="text-xs text-muted-foreground">Topics Pending</p>
            </div>
        </CardContent>
    </Card>
);


export default function DashboardClient() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [insights, setInsights] = useState<GenerateDashboardInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
  const [hasFetched, setHasFetched] = useState(false);


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setCurrentLoadingMessage(prev => {
            const nextIndex = (loadingMessages.indexOf(prev) + 1) % loadingMessages.length;
            return loadingMessages[nextIndex];
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    setHasFetched(true);

    try {
        const userProgress = await getSubjectsProgress(user.uid);
        
        if (userProgress.length === 0) {
             setInsights(null); 
        } else {
            const result = await generateDashboardInsights({
                studentName: user.displayName?.split(' ')[0] || 'Student',
                course: 'B.Pharm', 
                year: '2nd Year', 
                subjectsProgress: userProgress,
            });
            setInsights(result);
        }
    } catch (e: any) {
        console.error("Error generating dashboard insights:", e);
        const errorMessage = e.message.includes('503') 
            ? 'The AI model is currently overloaded. Please try again in a few moments.'
            : 'Failed to load smart insights. Please try refreshing.';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [user]);
  
  const chartConfig = {
      yourScore: { label: 'Your Score', color: 'hsl(var(--primary))' },
      classAverage: { label: 'Class Average', color: 'hsl(var(--muted-foreground))' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!</h1>
            <p className="mt-1 text-muted-foreground">{authLoading ? 'Loading your profile...' : 'Here are your quick actions for today.'}</p>
        </div>
      </div>
      
      {isAdmin && (
          <div className="mb-6">
              <AdminPanel />
          </div>
      )}

      <QuickActionsPanel />
      
      {!hasFetched && (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><BrainCircuit className="text-primary"/> Your Smart Dashboard</CardTitle>
                <CardDescription>Get personalized insights and suggestions based on your study progress.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">Click the button below to generate your AI-powered progress report.</p>
                <Button onClick={fetchInsights} disabled={isLoading || authLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BarChart3 className="mr-2 h-4 w-4"/>}
                    {isLoading ? 'Generating...' : 'View My Insights'}
                </Button>
            </CardContent>
        </Card>
      )}

      {isLoading && <DashboardSkeleton message={currentLoadingMessage} />}
      
      {hasFetched && !isLoading && error && (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Error Loading Dashboard</CardTitle>
                <CardDescription className="text-destructive/80">{error}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive" onClick={fetchInsights} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Try Again
                </Button>
            </CardContent>
        </Card>
      )}

      {hasFetched && !isLoading && !insights && !error && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Your Smart Dashboard is Ready!</CardTitle>
                <CardDescription>Your personalized insights will appear here once we have some progress data to analyze.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">Start by completing a few MCQs or exploring the notes library.</p>
                <Button asChild><Link href="/mcq-practice">Start a Quiz</Link></Button>
            </CardContent>
        </Card>
      )}

      {hasFetched && !isLoading && insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 flex flex-col gap-6">
                <SummaryStats insights={insights} />
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                       <div>
                         <CardTitle className="font-headline">AI-Powered Suggestions</CardTitle>
                         <CardDescription>Personalized tips to guide your study.</CardDescription>
                       </div>
                        <Button onClick={fetchInsights} variant="ghost" size="icon" disabled={isLoading}>
                          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                       </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {insights.aiSuggestions.map((tip, index) => (
                           <div key={index} className="flex items-start gap-3 text-sm p-3 bg-card-foreground/5 rounded-md">
                               <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                               <p className="text-foreground/80">{tip}</p>
                           </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            {/* Right Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Weekly Performance</CardTitle>
                        <CardDescription>Your score trend vs. the class average for the last 4 weeks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart accessibilityLayer data={insights.weeklyPerformance}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Line dataKey="yourScore" type="monotone" stroke="var(--color-yourScore)" strokeWidth={2} dot={{r: 4, fill: "var(--color-yourScore)"}} activeDot={{r: 6}} />
                                    <Line dataKey="classAverage" type="monotone" stroke="var(--color-classAverage)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                {insights.subjectsProgress && <SubjectProgress subjects={insights.subjectsProgress} />}
            </div>
        </div>
      )}
    </div>
  );
}
