
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, Target, NotebookPen, Gem, TrendingUp, Clock, Lightbulb, Users, Download, Share2, AlertTriangle, RefreshCw } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateDashboardInsights, type GenerateDashboardInsightsOutput } from '@/ai/flows/generate-dashboard-insights';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';

// --- FAKE DATA (used as input for the AI) ---
const subjectsProgress = [
    { 
        subject: "Pharmaceutics", 
        topics: [
            { title: "Introduction to Dosage Forms", status: "completed", lastAccessed: "2 days ago", estTime: "N/A" },
            { title: "Properties of Powders", status: "pending", lastAccessed: "1 week ago", estTime: "45 mins" },
        ] 
    },
    { 
        subject: "Pharmacology",
        topics: [
            { title: "General Pharmacology", status: "completed", lastAccessed: "3 days ago", estTime: "N/A" },
            { title: "Drugs Acting on ANS", status: "pending", lastAccessed: "Never", estTime: "1.5 hours" },
            { title: "Drug Distribution", status: "pending", lastAccessed: "Never", estTime: "1 hour" },
        ] 
    },
     { 
        subject: "Biochemistry",
        topics: [
            { title: "Biomolecules", status: "pending", lastAccessed: "Never", estTime: "2 hours" },
            { title: "Enzymes", status: "pending", lastAccessed: "Never", estTime: "1.5 hours" },
        ] 
    },
];

const chartConfig = {
  yourScore: {
    label: "Your Score",
    color: "hsl(var(--primary))",
  },
  classAverage: {
    label: "Class Average",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig

// --- COMPONENT ---

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Summary Cards Skeleton */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-2/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-1/4 mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                    </Card>
                ))}
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts and Suggestions Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                        <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                </div>
                {/* Admin Panel Skeleton (can remain static as it's not data-driven) */}
                <div className="lg:col-span-1">
                    <Card className="bg-card lg:sticky top-20">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Users /> Admin Dashboard</CardTitle>
                            <CardDescription>View and manage student progress.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                        <CardContent className="border-t pt-4">
                           <Skeleton className="h-5 w-1/2 mb-2" />
                           <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                        <CardContent className="flex flex-col sm:flex-row gap-2 pt-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Subject Progress Table Skeleton */}
            <section className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}

const AdminPanel = () => (
  <Card className="bg-card lg:sticky lg:top-20">
    <CardHeader>
      <CardTitle className="font-headline flex items-center gap-2"><Users /> Admin Dashboard</CardTitle>
      <CardDescription>View and manage student progress.</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <Select>
        <SelectTrigger><SelectValue placeholder="Filter by Student" /></SelectTrigger>
        <SelectContent><SelectItem value="student1">Student 1</SelectItem></SelectContent>
      </Select>
      <Select>
        <SelectTrigger><SelectValue placeholder="Filter by Batch" /></SelectTrigger>
        <SelectContent><SelectItem value="batch1">Batch 2024</SelectItem></SelectContent>
      </Select>
      <Select>
        <SelectTrigger><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
        <SelectContent><SelectItem value="pharma">Pharmacology</SelectItem></SelectContent>
      </Select>
    </CardContent>
    <CardContent className="border-t pt-4">
      <CardTitle className="text-lg font-semibold">Class Performance</CardTitle>
      <p className="text-sm text-muted-foreground mt-2">Overall class progress: <span className="font-bold text-primary">76%</span></p>
    </CardContent>
    <CardContent className="flex flex-col sm:flex-row gap-2 pt-4">
      <Button className="w-full"><Download className="mr-2 h-4 w-4"/> Export PDF</Button>
      <Button variant="outline" className="w-full"><Share2 className="mr-2 h-4 w-4"/> Share</Button>
    </CardContent>
  </Card>
);

const QuickActionsPanel = () => (
    <Card className="bg-card lg:sticky lg:top-20">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">🚀 Quick Actions</CardTitle>
            <CardDescription>Jump right into your learning journey.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3">
            <Button asChild variant="outline">
                <Link href="/notes"><BookOpen className="mr-2 h-4 w-4" /> Browse Notes Library</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/ai-notes"><BrainCircuit className="mr-2 h-4 w-4" /> Generate AI Notes</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/exam-questions"><NotebookPen className="mr-2 h-4 w-4" /> Predict Exam Questions</Link>
            </Button>
            <Button asChild className="bg-primary/10 text-primary hover:bg-primary/20">
                <Link href="/premium"><Gem className="mr-2 h-4 w-4" /> Upgrade to Premium</Link>
            </Button>
        </CardContent>
    </Card>
);


export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [insights, setInsights] = useState<GenerateDashboardInsightsOutput | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generateDashboardInsights({
            studentName: "Arvind", // This would be dynamic in a real app
            course: "B.Pharm",
            year: "2nd Year",
            subjectsProgress: subjectsProgress,
        });
        setInsights(result);
        setLastSynced(new Date());
      } catch (e: any) {
        console.error("Failed to fetch dashboard insights:", e);
        setError("Failed to generate smart insights. The AI model might be overloaded. Please try again in a moment.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const getProgressColorClass = (progress: number) => {
    if (progress > 75) return 'bg-green-500';
    if (progress > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getStatusBadge = (status: 'completed' | 'pending') => {
    if (status === 'completed') {
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">✔️ Completed</Badge>
    }
    return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">❌ Pending</Badge>
  }
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
     return (
        <Alert variant="destructive" className="max-w-xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            <AlertDescription>
                {error}
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </AlertDescription>
        </Alert>
     );
  }

  if (!insights) {
    return <DashboardSkeleton />;
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">A2GTRICKS Academy Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Your smart progress report at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
            {lastSynced && <Badge variant="secondary">Last synced: {lastSynced.toLocaleTimeString()}</Badge>}
        </div>
      </div>
      
      {/* Live Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{insights.totalProgress}%</div>
                  <Progress value={insights.totalProgress} indicatorClassName={getProgressColorClass(insights.totalProgress)} className="h-2 mt-2" />
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subjects Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{insights.subjectsCompleted}</div>
                  <p className="text-xs text-muted-foreground">out of {subjectsProgress.length} subjects</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Topics</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{insights.pendingTopics}</div>
                  <p className="text-xs text-muted-foreground">Across all subjects</p>
              </CardContent>
          </Card>
           <Card className="bg-primary/10 border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-primary">AI Next Topic Suggestion</CardTitle>
                  <BrainCircuit className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                  <div className="text-lg font-bold text-primary">{insights.aiNextTopicSuggestion}</div>
                  <p className="text-xs text-muted-foreground">Based on your progress</p>
              </CardContent>
          </Card>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Performance and AI Suggestions */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Smart Weekly Performance</CardTitle>
                    <CardDescription>Your weekly performance vs. class average, powered by AI.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={insights.weeklyPerformance}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="week" tickLine={false} tickMargin={10} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="yourScore" fill="var(--color-yourScore)" radius={4} />
                            <Bar dataKey="classAverage" fill="var(--color-classAverage)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Lightbulb className="text-primary"/> Auto Suggestions</CardTitle>
                    <CardDescription>Personalized tips from your AI mentor to improve your learning.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {insights.aiSuggestions.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 bg-secondary/50 p-3 rounded-lg">
                            <BrainCircuit className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                            <p className="text-sm text-secondary-foreground">{tip}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Side Panel: Admin or Quick Actions */}
        <div className="lg:col-span-1">
             {isAdmin ? <AdminPanel /> : <QuickActionsPanel />}
        </div>
      </div>

      {/* Subject-wise Progress */}
      <section className="space-y-4">
          <h2 className="text-2xl font-headline font-semibold">Subject-Wise Progress</h2>
          {subjectsProgress.map(subject => (
            <Card key={subject.subject}>
                <CardHeader>
                    <CardTitle>{subject.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Topic</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Accessed</TableHead>
                                <TableHead>Est. Completion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subject.topics.map(topic => (
                                <TableRow key={topic.title}>
                                    <TableCell className="font-medium">{topic.title}</TableCell>
                                    <TableCell>
                                        {getStatusBadge(topic.status as 'completed' | 'pending')}
                                    </TableCell>
                                    <TableCell>{topic.lastAccessed}</TableCell>
                                    <TableCell className="text-muted-foreground">{topic.estTime}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          ))}
      </section>

    </div>
  );
}
