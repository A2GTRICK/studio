
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, BrainCircuit, CheckSquare, Clock, Loader2, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { GenerateDashboardInsightsOutput } from '@/ai/flows/generate-dashboard-insights';
import { generateDashboardInsights } from '@/ai/flows/generate-dashboard-insights';
import { getSubjectsProgress } from '@/services/user-progress-service';
import { Progress } from '@/components/ui/progress';
import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type SubjectProgress = NonNullable<GenerateDashboardInsightsOutput['subjectsProgress'][0]>;

const SubjectProgressCard = ({ subjectProgress }: { subjectProgress: SubjectProgress }) => {
    const completed = subjectProgress.topics.filter(t => t.status === 'completed').length;
    const total = subjectProgress.topics.length;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    return (
        <Card className="bg-background/50">
            <CardHeader>
                <CardTitle>{subjectProgress.subject}</CardTitle>
                <div className="flex justify-between items-center text-sm text-muted-foreground pt-1">
                    <span>Overall Progress</span>
                    <span>{completed} / {total} Topics</span>
                </div>
                <Progress value={progress} className="mt-2 h-2" />
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>View Topic Details</AccordionTrigger>
                        <AccordionContent>
                            <ul className="space-y-3 mt-2">
                                {subjectProgress.topics.map((topic, index) => (
                                    <li key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-background">
                                        <span className="flex-1 pr-4">{topic.title}</span>
                                        {topic.status === 'completed' ? (
                                            <Badge variant="default" className="bg-green-600/80">
                                                <CheckSquare className="mr-2 h-3 w-3" />
                                                Completed
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <Clock className="mr-2 h-3 w-3" />
                                                Pending
                                            </Badge>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
};


const ReportSkeleton = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
         </div>
    </div>
);


export default function MyProgressPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<GenerateDashboardInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
        const userProgress = await getSubjectsProgress();
        if (userProgress.length === 0) {
             setInsights(null);
             return;
        }

        const result = await generateDashboardInsights({
            studentName: user.displayName?.split(' ')[0] || 'Student',
            course: 'B.Pharm', 
            year: '2nd Year', 
            subjectsProgress: userProgress,
        });
        setInsights(result);
    } catch (e: any) {
        console.error("Error generating progress report:", e);
        setError("Failed to load your progress report. The AI model might be temporarily unavailable.");
    } finally {
        setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user, fetchInsights]);
  
  const chartConfig = {
      yourScore: { label: 'Your Score', color: 'hsl(var(--primary))' },
      classAverage: { label: 'Class Average', color: 'hsl(var(--muted-foreground))' },
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-headline font-bold text-foreground">My Progress Report</h1>
            </div>
            <p className="text-muted-foreground">A detailed breakdown of your progress and AI-driven insights.</p>
        </div>
        <Button asChild variant="outline">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Dashboard
            </Link>
        </Button>
      </div>
      
       {isLoading && <ReportSkeleton />}

       {error && !isLoading && (
         <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle /> Error Loading Report</CardTitle>
                <CardDescription className="text-destructive/80">{error}</CardDescription>
            </CardHeader>
        </Card>
      )}

      {!isLoading && !error && insights && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Weekly Performance</CardTitle>
                        <CardDescription>Your score trend vs. the class average.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={insights.weeklyPerformance}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                                    <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Line dataKey="yourScore" type="monotone" stroke="var(--color-yourScore)" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} />
                                    <Line dataKey="classAverage" type="monotone" stroke="var(--color-classAverage)" strokeWidth={2} strokeDasharray="3 3" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">AI-Powered Suggestions</CardTitle>
                         <CardDescription>Personalized tips to guide your study.</CardDescription>
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
            
            <div>
                <h2 className="text-2xl font-headline font-bold mb-4">Subject Breakdown</h2>
                 {insights.subjectsProgress && insights.subjectsProgress.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {insights.subjectsProgress.map((subject, index) => (
                            <SubjectProgressCard key={index} subjectProgress={subject} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-10 text-center">
                            <p className="text-muted-foreground">No subjects or topics found. Please add notes in the admin panel to see progress.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
          </div>
      )}

    </div>
  );
}
