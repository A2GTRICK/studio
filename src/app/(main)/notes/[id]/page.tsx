
'use client';

import { notesData } from '@/lib/notes-data';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Gem, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NoteDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? parseInt(params.id, 10) : NaN;
  const note = notesData.find(n => n.id === id);

  if (!note) {
    notFound();
  }

  // If a user tries to access a premium note directly via URL
  if (note.isPremium) {
    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="p-4 rounded-full bg-destructive/10 mb-4">
                <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-3xl font-headline font-bold">Access Denied</h1>
            <p className="text-muted-foreground mt-2">This is a premium note. Please upgrade your plan to view this content.</p>
            <Button asChild className="mt-6">
                <Link href="/premium">
                    <Gem className="mr-2 h-4 w-4"/>
                    View Premium Plans
                </Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2">
                 <Link href="/notes">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Library
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-4">
            <Link href="/notes">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Notes Library
            </Link>
        </Button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="font-headline text-3xl">{note.title}</CardTitle>
              <CardDescription>Course: {note.course} | Year: {note.year} | Subject: {note.subject}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          {/* 
            This is where your actual note content would go. 
            In a real app, you would fetch this from a database (like Firestore) 
            or a markdown file.
          */}
          <h2>Introduction to {note.title}</h2>
          <p>
            This section provides a detailed overview of the fundamental concepts related to {note.title}. We will explore the core principles, historical context, and its significance in modern pharmacy practice. For students in the {note.course} program, understanding these basics is crucial for building a strong foundation in {note.subject}.
          </p>

          <h3>Key Concepts</h3>
          <ul>
            <li><strong>Concept A:</strong> Placeholder text explaining the first key concept. This would be replaced with actual content from your notes.</li>
            <li><strong>Concept B:</strong> Placeholder text explaining the second key concept. This content needs to be detailed and accurate.</li>
            <li><strong>Concept C:</strong> Placeholder text explaining the third key concept. This is where you would elaborate on important definitions and mechanisms.</li>
          </ul>

          <h3>Detailed Explanation (Placeholder)</h3>
          <p>
            Here, the note would dive deeper into the specifics. For example, in Pharmaceutical Analysis, this section might cover the principles of titration, the types of indicators used, and the mathematical formulas for calculation. Each point would be explained with clarity, supported by diagrams or examples where necessary. 
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sed ante et nisi maximus commodo. Curabitur vel sem vel velit auctor blandit. Vivamus nec quam nec libero consectetur commodo. Nullam ac urna eu felis dapibus condimentum.
          </p>

          <blockquote>
            This is a blockquote for highlighting important information, definitions, or clinical pearls. It helps draw the student's attention to critical points.
          </blockquote>

          <h3>Conclusion</h3>
          <p>
            This placeholder concludes the note on {note.title}. A real note would summarize the key takeaways and might include review questions or a brief look at future trends in the field.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
