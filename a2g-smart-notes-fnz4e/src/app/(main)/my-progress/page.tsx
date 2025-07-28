
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BrainCircuit, CheckSquare, Clock, Loader2, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getSubjectsProgress } from '@/services/user-progress-service';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Define a simple type for subject progress as we are no longer using the AI flow
type SubjectProgress = {
    subject: string;
    topics: {
        title: string;
        status: 'completed' | 'pending';
    }[];
};

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
                                            <Badge variant="default" className="bg-green-600/80 hover:bg-green-600/90">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
         </div>
    </div>
);


export default function MyProgressPage() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<SubjectProgress[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
        const userProgress = await getSubjectsProgress(user.uid);
        setProgressData(userProgress);
    } catch (e: any) {
        console.error("Error fetching progress report:", e);
        setError("Failed to load your progress report. Please try again later.");
    } finally {
        setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    } else {
        setIsLoading(false);
    }
  }, [user, fetchProgress]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-headline font-bold text-foreground">My Progress Report</h1>
            </div>
            <p className="text-muted-foreground">A detailed breakdown of your quiz performance and topic completion.</p>
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
             <CardContent>
                <Button onClick={fetchProgress} variant="destructive">
                    Retry Now
                </Button>
            </CardContent>
        </Card>
      )}

      {!isLoading && !error && (!progressData || progressData.length === 0) && (
          <Card>
              <CardContent className="p-10 text-center">
                  <h3 className="text-xl font-semibold">No Progress Data Found</h3>
                  <p className="text-muted-foreground mt-2">Your progress report will appear here once you start taking MCQ quizzes.</p>
                  <Button asChild className="mt-4"><Link href="/mcq-practice">Start a Quiz</Link></Button>
              </CardContent>
          </Card>
      )}

      {!isLoading && !error && progressData && progressData.length > 0 && (
            <div>
                <h2 className="text-2xl font-headline font-bold mb-4">Subject Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {progressData.map((subject, index) => (
                        <SubjectProgressCard key={index} subjectProgress={subject} />
                    ))}
                </div>
            </div>
      )}

    </div>
  );
}
