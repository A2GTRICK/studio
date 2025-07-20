
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyProgressPage() {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-headline font-bold text-foreground">My Progress Report</h1>
            </div>
            <p className="text-muted-foreground">A detailed breakdown of your progress across all subjects and topics.</p>
        </div>
        <Button asChild variant="outline">
            <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Dashboard
            </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Progress Tracking is Evolving</CardTitle>
            <CardDescription>We're building a smarter way for you to track your learning journey.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-20">
            <BrainCircuit className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold">Coming Soon!</h3>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                This page will soon feature detailed analytics of your completed notes, quiz scores, and study patterns. Our goal is to provide you with actionable insights to help you study more effectively. Stay tuned!
            </p>
        </CardContent>
    </Card>

    </div>
  );
}
