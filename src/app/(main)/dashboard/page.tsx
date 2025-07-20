
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BrainCircuit, NotebookPen, Gem, Users, AlertTriangle, RefreshCw } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

const AdminPanel = () => (
  <Card className="bg-card lg:sticky lg:top-20">
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

const ComingSoonPanel = () => (
    <Card className="lg:col-span-3">
        <CardHeader>
            <CardTitle className="font-headline">Smart Insights and Progress Tracking</CardTitle>
            <CardDescription>A new way to visualize your learning journey is on the horizon.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
            <BrainCircuit className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-muted-foreground mt-2">
                We're developing an intelligent system to track your progress on notes and quizzes. <br />
                Soon, you'll see personalized analytics and suggestions right here.
            </p>
        </CardContent>
    </Card>
);


export default function DashboardPage() {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return null; // Or a skeleton loader
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!</h1>
            <p className="mt-1 text-muted-foreground">Ready to start learning?</p>
        </div>
      </div>
      
      {!isAdmin && <QuickActionsPanel />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
            <ComingSoonPanel />
        </div>
        
        {isAdmin && (
            <div className="lg:col-span-3">
                <AdminPanel />
            </div>
        )}
      </div>
    </div>
  );
}
