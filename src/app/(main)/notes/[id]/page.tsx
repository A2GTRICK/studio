
'use client';

import { useState, useEffect, useCallback }from 'react';
import { notFound, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { marked } from 'marked';
import type { Note } from '@/context/notes-context';
import { useAuth } from '@/hooks/use-auth';

export default function NoteDetailPage() {
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : '';
    const { user, loading: authLoading } = useAuth();

    const fetchNote = useCallback(async () => {
        if (!id || !user) return; // Wait for user to be authenticated
        setLoading(true);
        try {
            const noteDoc = await getDoc(doc(db, 'notes', id));
            if (noteDoc.exists()) {
                setNote({ ...noteDoc.data(), id: noteDoc.id } as Note);
            } else {
                notFound();
            }
        } catch (error) {
            console.error("Error fetching note:", error);
            notFound();
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        // Only fetch note when auth state is resolved and user exists
        if (!authLoading && user) {
            fetchNote();
        } else if (!authLoading && !user) {
            // Handle case where user is not logged in after auth check
            setLoading(false);
            // Optionally redirect or show an error
        }
    }, [fetchNote, authLoading, user]);

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!note) {
        return notFound();
    }

    const renderContent = () => {
        if (note.content && (note.content.startsWith('http://') || note.content.startsWith('https://'))) {
             return (
                <div className="text-center p-8 bg-muted/50 rounded-lg">
                    <ExternalLink className="h-12 w-12 mx-auto text-primary mb-4"/>
                    <h3 className="text-xl font-semibold mb-2">External Google Drive Document</h3>
                    <p className="text-muted-foreground mb-6">This note is stored in Google Drive. Click the button below to open it in a new tab.</p>
                    <Button asChild>
                        <a href={note.content} target="_blank" rel="noopener noreferrer">
                            Open Google Drive Document <ExternalLink className="ml-2 h-4 w-4"/>
                        </a>
                    </Button>
                </div>
             )
        }
        
        // For AI-generated notes and uploaded file content
        const htmlContent = marked.parse(note.content || "");
        return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    };


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button asChild variant="ghost">
                <Link href="/notes">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Notes Library
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-4xl">{note.title}</CardTitle>
                            <CardDescription className="mt-2 text-base">{note.course} &bull; {note.year} &bull; {note.subject}</CardDescription>
                        </div>
                         {note.isPremium && <Badge>{note.price ? `Premium - INR ${note.price}` : 'Premium'}</Badge>}
                    </div>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}
