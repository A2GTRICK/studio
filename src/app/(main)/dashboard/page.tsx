
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

// --- FAKE DATA ---
const summaryData = {
  totalProgress: 68,
  subjectsCompleted: 2,
  pendingTopics: 12,
  aiSuggestion: "Biopharmaceutics and Pharmacokinetics",
};

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
        ] 
    },
];

const weeklyPerformanceData = [
  { week: "Week 1", yourScore: 65, classAverage: 70 },
  { week: "Week 2", yourScore: 78, classAverage: 72 },
  { week: "Week 3", yourScore: 72, classAverage: 75 },
  { week: "Week 4", yourScore: 85, classAverage: 78 },
];

const aiSuggestions = [
    "Focus on 'Drug Distribution' in Pharmacology. Your recent quiz scores indicate a slight weakness here.",
    "You study best in the mornings. Try scheduling your 'Properties of Powders' review session for tomorrow at 8 AM.",
    "Allocate an extra 30 minutes to practice questions for Biopharmaceutics to solidify your understanding."
]

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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate data fetching
      const success = Math.random() > 0.2; // 80% chance of success
      if (success) {
        setIsLoading(false);
        setIsError(false);
        setLastSynced(new Date());
      } else {
        setIsLoading(false);
        setIsError(true);
        setLastSynced(new Date(Date.now() - 3 * 60 * 60 * 1000)); // 3 hours ago
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getProgressColor = (progress: number) => {
    if (progress > 75) return 'bg-green-500';
    if (progress > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">A2GTRICKS Academy Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Your smart progress report at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
            {isLoading && <Badge variant="outline" className="text-muted-foreground animate-pulse"><RefreshCw className="mr-2 h-3 w-3 animate-spin" /> Syncing...</Badge>}
            {isError && <Badge variant="destructive"><AlertTriangle className="mr-2 h-3 w-3" /> Live data syncing failed.</Badge>}
            {!isLoading && !isError && lastSynced && <Badge variant="secondary">Last synced: {lastSynced.toLocaleTimeString()}</Badge>}
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
                  <div className="text-2xl font-bold">{summaryData.totalProgress}%</div>
                  <Progress value={summaryData.totalProgress} className={`h-2 mt-2 ${getProgressColor(summaryData.totalProgress)}`} />
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subjects Completed</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{summaryData.subjectsCompleted}</div>
                  <p className="text-xs text-muted-foreground">out of {subjectsProgress.length} subjects</p>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Topics</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{summaryData.pendingTopics}</div>
                  <p className="text-xs text-muted-foreground">Across all subjects</p>
              </CardContent>
          </Card>
           <Card className="bg-primary/10 border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-primary">AI Next Topic Suggestion</CardTitle>
                  <BrainCircuit className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                  <div className="text-lg font-bold text-primary">{summaryData.aiSuggestion}</div>
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
                    <CardDescription>
                        {isError ? `Showing last synced data from ${lastSynced?.toLocaleString()}` : 'Your weekly performance vs. class average.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={weeklyPerformanceData}>
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
                    {aiSuggestions.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 bg-secondary/50 p-3 rounded-lg">
                            <BrainCircuit className="h-5 w-5 mt-0.5 text-primary shrink-0" />
                            <p className="text-sm text-secondary-foreground">{tip}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Admin Panel */}
        <div className="lg:col-span-1">
             <Card className="bg-card sticky top-20">
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
                    <Button className="w-full"><Download className="mr-2"/> Export PDF</Button>
                    <Button variant="outline" className="w-full"><Share2 className="mr-2"/> Share</Button>
                </CardContent>
            </Card>
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
                                <TableHead className="w-[50%]">Topic</TableHead>
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
                                        <Badge variant={topic.status === 'completed' ? 'default' : 'secondary'} className={topic.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>
                                            {topic.status === 'completed' ? '✔️ Completed' : '❌ Pending'}
                                        </Badge>
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
