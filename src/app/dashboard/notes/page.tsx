
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MoreVertical, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Note, getNotes, deleteNote } from '@/services/notes';
import { useToast } from '@/hooks/use-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchNotes() {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch your notes. Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotes();
  }, [toast]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    try {
        await deleteNote(id);
        setNotes(notes.filter(note => note.id !== id));
        toast({
            title: 'Note Deleted',
            description: 'The note has been successfully deleted.',
        });
    } catch (error) {
        console.error("Error deleting note:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to delete the note. Please try again later.',
        });
    }
  };
  
  const getSnippet = (content: string) => {
    const strippedContent = content.replace(/(\#\#\#\# |\#\#\# |\#\# |\# )/g, "");
    return strippedContent.slice(0, 150) + '...';
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">My Notes</h1>
        <p className="text-muted-foreground">
          All your generated and saved notes in one place.
        </p>
      </div>
      {isLoading ? (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      ) : notes.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p className="font-semibold">No notes found.</p>
            <p className="text-sm">Generate some notes with the AI Note Generator to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
            <Card key={note.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="font-headline text-xl pr-2">{note.topic}</CardTitle>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(note.id!)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardDescription>{note.subject}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{getSnippet(note.notes)}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                <Button variant="outline" size="sm">Read More</Button>
                {/* {note.isPremium && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
                    <Star className="mr-1 h-3 w-3 text-accent" />
                    Premium
                    </Badge>
                )} */}
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
}
