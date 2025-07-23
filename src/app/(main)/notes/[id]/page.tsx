
'use client';

import { useState, useEffect, useCallback }from 'react';
import { notFound, useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Note } from '@/app/(main)/admin/notes/page';
import { Loader2, ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { marked } from 'marked';

export default function NoteDetailPage() {
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : '';

    const fetchNote = useCallback(async () => {
        if (!id) return;
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
    }, [id]);

    useEffect(() => {
        fetchNote();
    }, [fetchNote]);

    if (loading) {
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
        if (note.content.startsWith('http')) {
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
        if (note.content.startsWith('File Uploaded:')) {
            return (
                 <div className="text-center p-8 bg-muted/50 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-primary mb-4"/>
                    <h3 className="text-xl font-semibold mb-2">Content from Uploaded File</h3>
                    <p className="text-muted-foreground">This note's content originated from an uploaded file named:</p>
                    <p className="font-mono text-sm bg-background p-2 rounded-md my-4 inline-block">{note.content.replace('File Uploaded: ', '')}</p>
                    <p className="text-muted-foreground mt-2 text-xs">(Full file content viewing is not yet supported in the app.)</p>
                </div>
            )
        }
        const htmlContent = marked.parse(note.content);
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
    
