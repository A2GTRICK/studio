
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Using the same fake data as the dashboard for consistency
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
    { 
        subject: "Human Anatomy and Physiology",
        topics: [
            { title: "The Integumentary System", status: "completed", lastAccessed: "1 month ago", estTime: "N/A" },
            { title: "The Skeletal System", status: "pending", lastAccessed: "Never", estTime: "2 hours" },
             { title: "The Muscular System", status: "pending", lastAccessed: "Never", estTime: "2.5 hours" },
        ] 
    },
];

export default function MyProgressPage() {

  const getStatusBadge = (status: 'completed' | 'pending') => {
    if (status === 'completed') {
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">✔️ Completed</Badge>
    }
    return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">❌ Pending</Badge>
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-primary" />
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
      
      {/* Subject-wise Progress */}
      <section className="space-y-4">
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


    