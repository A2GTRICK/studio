
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, CheckSquare, Gem, GraduationCap, Shield } from "lucide-react";
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

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


export default function DashboardClient() {
  const { user, isAdmin, loading: authLoading } = useAuth();

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
      
    </div>
  );
}
