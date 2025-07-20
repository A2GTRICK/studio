
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BrainCircuit, NotebookPen, Gem, Users, AlertTriangle, RefreshCw, ChevronDown, ChevronUp, CheckSquare, Target, BookCheck } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { GenerateDashboardInsightsOutput } from '@/ai/flows/generate-dashboard-insights';
import { generateDashboardInsights } from '@/ai/flows/generate-dashboard-insights';
import { Line, LineChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';


const AdminPanel = () => (
  <Card className="bg-card">
    <CardHeader>
      <CardTitle className="font-headline flex items-center gap-2"><Users /> Admin Dashboard</CardTitle>
      <CardDescription>This panel is only visible to administrators.</CardDescription>
    </CardHeader>
    <CardContent>
        <Button asChild className="w-full">
            <Link href="/admin/notes">Manage Notes Library</Link>
        </Button>
    </CardContent>
  </Card>
);

const QuickActionsPanel = () => (
    <Card className="bg-card">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">🚀 Quick Actions</CardTitle>
            <CardDescription>Jump right into your learning journey.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            <Button asChild variant="outline" size="lg" className="h-20 flex-col items-start p-4 gap-2">
                <Link href="/notes"><div className="flex items-center gap-2"><BookOpen /> <span className="font-bold">Notes Library</span></div><span className="text-xs font-normal text-muted-foreground">Browse all expert-written notes</span></Link>
            </Button>
             <Button asChild variant="outline" size="lg" className="h-20 flex-col items-start p-4 gap-2">
                <Link href="/ai-notes"><div className="flex items-center gap-2"><BrainCircuit /> <span className="font-bold">AI Notes</span></div><span className="text-xs font-normal text-muted-foreground">Generate notes on any topic</span></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-20 flex-col items-start p-4 gap-2">
                <Link href="/mcq-practice"><div className="flex items-center gap-2"><CheckSquare /> <span className="font-bold">MCQ Practice</span></div><span className="text-xs font-normal text-muted-foreground">Test your knowledge for exams</span></Link>
            </Button>
            <Button asChild className="bg-primary/10 text-primary hover:bg-primary/20 h-20 flex-col items-start p-4 gap-2" size="lg">
                <Link href="/premium"><div className="flex items-center gap-2"><Gem /> <span className="font-bold">Go Premium</span></div><span className="text-xs font-normal text-primary/80">Unlock all features</span></Link>
            </Button>
        </CardContent>
    </Card>
);

const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><div className="grid grid-cols-3 gap-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
             <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
             <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
    </div>
);


const SubjectProgress = ({ subjects }: { subjects: NonNullable<GenerateDashboardInsightsOutput['subjectsProgress']> }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!subjects || subjects.length === 0) {
        return null;
    }

    const displayedSubjects = isExpanded ? subjects : subjects.slice(0, 2);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Subject-wise Progress</CardTitle>
                <CardDescription>High-level overview of your study status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayedSubjects.map((subject, index) => {
                    const completed = subject.topics.filter(t => t.status === 'completed').length;
                    const total = subject.topics.length;
                    const progress = total > 0 ? (completed / total) * 100 : 0;
                    return (
                        <Card key={index} className="bg-background/50">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                     <p className="font-semibold">{subject.subject}</p>
                                     <p className="text-sm text-muted-foreground">{completed} / {total} topics</p>
                                </div>
                               <Progress value={progress} />
                            </CardContent>
                        </Card>
                    )
                })}
            </CardContent>
            {subjects.length > 2 && (
                 <CardContent>
                    <Button variant="outline" className="w-full" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                        {isExpanded ? 'Show Less' : 'View Full Report'}
                    </Button>
                </CardContent>
            )}
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


export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [insights, setInsights] = useState<GenerateDashboardInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
        // This is simulated data. In a real app, you'd fetch this from your database.
        const simulatedProgress = [
            { subject: "Pharmacology", topics: [{ title: "General Pharmacology", status: "completed", lastAccessed: "2 days ago", estTime: "N/A"}, { title: "Drugs Acting on ANS", status: "pending", lastAccessed: "2 days ago", estTime: "1.5 hours" }, { title: "Autacoids", status: "pending", lastAccessed: "Never", estTime: "1 hour" }] },
            { subject: "Pharmaceutics", topics: [{ title: "Dosage Forms", status: "completed", lastAccessed: "5 days ago", estTime: "N/A" }, { title: "Introduction to NDDS", status: "completed", lastAccessed: "1 day ago", estTime: "N/A" }] },
            { subject: "Biochemistry", topics: [{ title: "Carbohydrates & Lipids", status: "pending", lastAccessed: "Never", estTime: "2 hours" }, { title: "Proteins & Amino Acids", status: "pending", lastAccessed: "Never", estTime: "1.5 hours" }] },
            { subject: "Pathophysiology", topics: [{ title: "Basic Principles", status: "completed", lastAccessed: "1 week ago", estTime: "N/A" }, { title: "Infectious Diseases", status: "pending", lastAccessed: "Never", estTime: "2 hours" }] }
        ];

        const result = await generateDashboardInsights({
            studentName: user.displayName?.split(' ')[0] || 'Student',
            course: 'B.Pharm',
            year: '2nd Year',
            subjectsProgress: simulatedProgress,
        });
        setInsights(result);
    } catch (e: any) {
        console.error("Error generating dashboard insights:", e);
        setError("Failed to load smart insights. The AI model might be temporarily unavailable.");
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

  if (isLoading) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                  <h1 className="text-3xl font-headline font-bold text-foreground">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!</h1>
                  <p className="mt-1 text-muted-foreground">Analyzing your progress...</p>
              </div>
            </div>
            {!isAdmin && <QuickActionsPanel />}
            <DashboardSkeleton />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!</h1>
            <p className="mt-1 text-muted-foreground">Here is your smart dashboard for today.</p>
        </div>
        <div>
          <Button onClick={fetchInsights} variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
             Refresh Insights
          </Button>
        </div>
      </div>
      
      {!isAdmin && <QuickActionsPanel />}

      {error && !insights && (
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

      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <SummaryStats insights={insights} />
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
      
      {isAdmin && (
          <div className="mt-6">
              <AdminPanel />
          </div>
      )}
    </div>
  );
}
