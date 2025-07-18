import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BrainCircuit, GraduationCap } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="bg-card p-6 md:p-8 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Welcome to A2G Smart Notes</h1>
            <p className="mt-4 text-lg text-muted-foreground">Your comprehensive toolkit for academic excellence in pharmacy. Explore our resources and supercharge your studies.</p>
            <Button asChild className="mt-6">
                <Link href="/notes">Start Exploring <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="hidden md:block">
            <Image src="https://placehold.co/300x200.png" alt="Pharmacy student studying" width={300} height={200} className="rounded-lg shadow-md" data-ai-hint="student studying" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline"><BookOpen className="text-primary"/> Notes Library</CardTitle>
              <CardDescription>Browse our extensive collection of curated study notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/notes">Explore Notes <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline"><BrainCircuit className="text-primary"/> AI Tools</CardTitle>
              <CardDescription>Generate notes and exam questions with our smart AI assistants.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/ai-notes">Use AI Tools <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline"><GraduationCap className="text-primary"/> Academic Services</CardTitle>
              <CardDescription>Get expert help with your academic projects and writing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/services">View Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
