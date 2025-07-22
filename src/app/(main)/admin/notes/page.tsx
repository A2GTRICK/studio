
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, FileUp, Edit, Trash2, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, FieldPath } from 'firebase/firestore';
import { getDocsFromCache } from 'firebase/firestore';

export type Note = {
    id: string;
    title: string;
    course: string;
    year: string;
    subject: string;
    preview: string;
    isPremium: boolean;
    createdAt: any;
};

const loadingMessages = [
    "Admin powers activating...",
    "Database se saare notes laa rahe hain...",
    "Sorting notes by 'most recently added'...",
    "Almost there, boss!"
];

export default function AdminNotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);

     useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
          interval = setInterval(() => {
            setCurrentLoadingMessage(prev => {
                const nextIndex = (loadingMessages.indexOf(prev) + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
          }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);
    
    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const notesCollection = collection(db, 'notes');
            const q = query(notesCollection, orderBy('createdAt', 'desc'));
            const notesSnapshot = await getDocs(q);
            const notesList = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Note[];
            setNotes(notesList);
        } catch (error) {
            console.error("Error fetching notes:", error);
            toast({
                title: "Error fetching notes",
                description: "Could not retrieve notes from the database.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const newNote = {
            title: formData.get('title') as string,
            course: formData.get('course') as string,
            year: formData.get('year') as string,
            subject: formData.get('subject') as string,
            preview: formData.get('preview') as string,
            isPremium: formData.get('isPremium') === 'on',
            createdAt: serverTimestamp(),
        };

        if (!newNote.course || !newNote.year) {
            toast({
                title: "Missing Information",
                description: "Please select a course and year for the note.",
                variant: "destructive"
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const docRef = await addDoc(collection(db, 'notes'), newNote);
            setNotes(prev => [{...newNote, id: docRef.id, createdAt: new Date() }, ...prev]);
            toast({
                title: "Note Added Successfully!",
                description: `"${newNote.title}" has been added to the library.`
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error("Error adding note:", error);
            toast({
                title: "Error adding note",
                description: "There was a problem saving the note.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteDoc(doc(db, 'notes', noteId));
            setNotes(prev => prev.filter(note => note.id !== noteId));
            toast({
                title: "Note Deleted",
                description: "The note has been removed from the library.",
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error deleting note:", error);
            toast({
                title: "Error deleting note",
                description: "There was a problem deleting the note.",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><FileUp /> Add New Note</CardTitle>
                        <CardDescription>Add a new note's details to the library. The note will be live immediately.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleAddNote}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Note Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Human Anatomy..." required disabled={isSubmitting} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                    <Select name="course" required disabled={isSubmitting}>
                                        <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="B.Pharm">B.Pharm</SelectItem>
                                            <SelectItem value="D.Pharm">D.Pharm</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Select name="year" required disabled={isSubmitting}>
                                        <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1st Year">1st Year</SelectItem>
                                            <SelectItem value="2nd Year">2nd Year</SelectItem>
                                            <SelectItem value="3rd Year">3rd Year</SelectItem>
                                            <SelectItem value="4th Year">4th Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                             </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" placeholder="e.g., HAP I" required disabled={isSubmitting}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preview">Short Preview Text</Label>
                                <Textarea id="preview" name="preview" placeholder="A brief description of the note's content." required disabled={isSubmitting}/>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isPremium" name="isPremium" disabled={isSubmitting}/>
                                <Label htmlFor="isPremium">Mark as Premium</Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                {isSubmitting ? 'Adding...' : 'Add Note to Library'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Manage Existing Notes</CardTitle>
                        <CardDescription>View, edit, or delete notes currently in the library.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground animate-pulse">{currentLoadingMessage}</p>
                            </div>
                        ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notes.map(note => (
                                    <TableRow key={note.id}>
                                        <TableCell className="font-medium">{note.title}</TableCell>
                                        <TableCell>{note.course} - {note.year}</TableCell>
                                        <TableCell>
                                            {note.isPremium ? <Badge>Premium</Badge> : <Badge variant="secondary">Free</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Actions</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => toast({title: "Edit feature coming soon!"})}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the note titled "{note.title}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteNote(note.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Yes, delete note
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
