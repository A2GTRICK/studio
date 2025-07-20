
'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BrainCircuit, NotebookPen, Gem, Users, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import type { GenerateDashboardInsightsOutput } from '@/ai/flows/generate-dashboard-insights';
import { generateDashboardInsights } from '@/ai/flows/generate-dashboard-insights';
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';

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
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button asChild variant="outline" size="lg">
                <Link href="/notes"><BookOpen className="mr-2 h-4 w-4" /> Browse Notes Library</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                <Link href="/ai-notes"><BrainCircuit className="mr-2 h-4 w-4" /> Generate AI Notes</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                <Link href="/exam-questions"><NotebookPen className="mr-2 h-4 w-4" /> Predict Exam Questions</Link>
            </Button>
            <Button asChild className="bg-primary/10 text-primary hover:bg-primary/20" size="lg">
                <Link href="/premium"><Gem className="mr-2 h-4 w-4" /> Upgrade to Premium</Link>
            </Button>
        </CardContent>
    </Card>
);

const DashboardSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
    </div>
);


const SubjectProgress = ({ subjects }: { subjects: GenerateDashboardInsightsOutput['subjectsProgress'] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayedSubjects = isExpanded ? subjects : subjects.slice(0, 2);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Subject-wise Progress</CardTitle>
                <CardDescription>High-level overview of your study status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {displayedSubjects.map((subject, index) => (
                    <Card key={index} className="bg-background/50">
                        <CardHeader className="p-4">
                             <CardTitle className="text-base font-semibold">{subject.subject}</CardTitle>
                             <CardDescription>
                                {subject.topics.filter(t => t.status === 'completed').length} / {subject.topics.length} topics completed
                             </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
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
        const dummyProgress = [
            { subject: "Pharmacology", topics: [{ title: "General Pharmacology", status: "completed", lastAccessed: "2 days ago", estTime: "N/A"}, { title: "Drugs Acting on ANS", status: "pending", lastAccessed: "2 days ago", estTime: "1.5 hours" }] },
            { subject: "Pharmaceutics", topics: [{ title: "Dosage Forms", status: "completed", lastAccessed: "5 days ago", estTime: "N/A" }, { title: "Introduction to NDDS", status: "completed", lastAccessed: "1 day ago", estTime: "N/A" }] },
            { subject: "Biochemistry", topics: [{ title: "Carbohydrates & Lipids", status: "pending", lastAccessed: "Never", estTime: "2 hours" }, { title: "Proteins & Amino Acids", status: "pending", lastAccessed: "Never", estTime: "1.5 hours" }] },
            { subject: "Pathophysiology", topics: [{ title: "Basic Principles", status: "completed", lastAccessed: "1 week ago", estTime: "N/A" }] }
        ];

        const result = await generateDashboardInsights({
            studentName: user.displayName?.split(' ')[0] || 'Student',
            course: 'B.Pharm',
            year: '2nd Year',
            subjectsProgress: dummyProgress,
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
                  <p className="mt-1 text-muted-foreground">Ready to start learning?</p>
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
            <p className="mt-1 text-muted-foreground">Ready to start learning?</p>
        </div>
        <div>
          {isAdmin && <Button onClick={fetchInsights} variant="outline" size="sm"><RefreshCw className="mr-2 h-4 w-4" /> Refresh Insights</Button>}
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
                <Button variant="destructive" onClick={fetchInsights}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>
            </CardContent>
        </Card>
      )}

      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Next Topic Suggestion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center text-center p-4 bg-primary/10 rounded-lg">
                           <BrainCircuit className="h-10 w-10 text-primary mb-3" />
                           <p className="font-semibold text-lg">{insights.aiNextTopicSuggestion}</p>
                           <Button size="sm" className="mt-4" asChild>
                              <Link href="/ai-notes">Start Studying <ArrowRight className="ml-2 h-4 w-4" /></Link>
                           </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">AI-Powered Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {insights.aiSuggestions.map((tip, index) => (
                           <div key={index} className="flex items-start gap-3 text-sm p-3 bg-card-foreground/5 rounded-md">
                               <Gem className="h-4 w-4 text-primary mt-0.5 shrink-0" />
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
                        <CardDescription>Your score vs. the class average for the last 4 weeks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                            <BarChart accessibilityLayer data={insights.weeklyPerformance}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Legend content={<ChartLegendContent />} />
                                <Bar dataKey="yourScore" fill="var(--color-yourScore)" radius={4} />
                                <Bar dataKey="classAverage" fill="var(--color-classAverage)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <SubjectProgress subjects={insights.subjectsProgress} />
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

    