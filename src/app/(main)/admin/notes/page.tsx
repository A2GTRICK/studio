
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, BrainCircuit, UploadCloud, Link as LinkIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/alert-dialog"
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { generateNotesFromTopic } from '@/ai/flows/generate-notes-from-topic';


export type Note = {
    id: string;
    title: string;
    course: string;
    year: string;
    subject: string;
    content: string; 
    isPremium: boolean;
    createdAt: any;
};

const loadingMessages = [
    "Admin powers activating...",
    "Database se saare notes laa rahe hain...",
    "Sorting notes by 'most recently added'...",
    "Almost there, boss!"
];

const submissionMessages = [
    "Details ko verify kar rahe hain...",
    "Note ko library mein save kar rahe hain...",
    "Ek second, bas ho gaya...",
    "AI se content generate kar rahe hain...",
];

const yearOptions: { [key: string]: string[] } = {
    "B.Pharm": ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    "D.Pharm": ["1st Year", "2nd Year"],
};

export default function AdminNotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState(loadingMessages[0]);
    const [currentSubmissionMessage, setCurrentSubmissionMessage] = useState(submissionMessages[0]);
    const [selectedCourse, setSelectedCourse] = useState<"B.Pharm" | "D.Pharm" | "">("");
    const [activeTab, setActiveTab] = useState("ai");
    
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

     useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSubmitting) {
          interval = setInterval(() => {
            setCurrentSubmissionMessage(prev => {
                const nextIndex = (submissionMessages.indexOf(prev) + 1) % submissionMessages.length;
                return submissionMessages[nextIndex];
            });
          }, 2500);
        }
        return () => clearInterval(interval);
    }, [isSubmitting]);
    
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
        const form = e.currentTarget;
        const formData = new FormData(form);
        let content = '';
        
        const noteDetails = {
            title: formData.get('title') as string,
            course: formData.get('course') as string,
            year: formData.get('year') as string,
            subject: formData.get('subject') as string,
            isPremium: formData.get('isPremium') === 'on',
        };

        if (!noteDetails.course || !noteDetails.year || !noteDetails.title || !noteDetails.subject) {
            toast({ title: "All Fields Required", description: "Please fill out all the metadata fields.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            if (activeTab === 'ai') {
                 const result = await generateNotesFromTopic({
                    course: noteDetails.course,
                    year: noteDetails.year,
                    subject: noteDetails.subject,
                    topic: noteDetails.title,
                });
                content = result.notes;
            } else if (activeTab === 'pdf') {
                const file = formData.get('noteFile') as File;
                if (file && file.size > 0) {
                    content = `### Note Content from Uploaded File\n\nThis note's content originates from an uploaded file: **${file.name}**. \n\n*In a future update, this page will display the full content of the PDF, Word, or PowerPoint document directly. For now, this serves as a placeholder to confirm the note has been added to the library.*`;
                } else {
                     toast({ title: "File Required", description: "Please select a file to upload.", variant: "destructive" });
                     setIsSubmitting(false);
                     return;
                }
            } else { // link
                content = formData.get('driveLink') as string;
                if (!content) {
                    toast({ title: "Link Required", description: "Please enter a Google Drive link.", variant: "destructive" });
                    setIsSubmitting(false);
                    return;
                }
            }
            
            const newNote = { ...noteDetails, content };
            const docRef = await addDoc(collection(db, 'notes'), {
                ...newNote,
                createdAt: serverTimestamp(),
            });
            
            const newNoteForState: Note = {
                ...newNote,
                id: docRef.id,
                createdAt: new Date(),
            };

            setNotes(prev => [newNoteForState, ...prev]);

            toast({
                title: "Note Added Successfully!",
                description: `"${noteDetails.title}" has been added to the library.`
            });
            form.reset();
            setSelectedCourse("");

        } catch (error: any) {
            console.error("Error adding note:", error);
            const errorMessage = error.message.includes('503') 
                ? 'The AI model is currently overloaded. Please try again in a few moments.'
                : 'There was a problem saving the note.';
            toast({
                title: "Error adding note",
                description: errorMessage,
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start p-4 md:p-6">
            <div className="lg:col-span-1">
                <form onSubmit={handleAddNote}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><PlusCircle /> Add New Note</CardTitle>
                            <CardDescription>Add a new note's details to the library. The note will be live immediately.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Note Title / Topic</Label>
                                <Input id="title" name="title" placeholder="e.g., Human Anatomy..." required disabled={isSubmitting} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                    <Select name="course" required disabled={isSubmitting} onValueChange={(value) => setSelectedCourse(value as any)}>
                                        <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="B.Pharm">B.Pharm</SelectItem>
                                            <SelectItem value="D.Pharm">D.Pharm</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Select name="year" required disabled={isSubmitting || !selectedCourse}>
                                        <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                                        <SelectContent>
                                            {selectedCourse && yearOptions[selectedCourse]?.map(year => (
                                                <SelectItem key={year} value={year}>{year}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" name="subject" placeholder="e.g., HAP I" required disabled={isSubmitting}/>
                            </div>
                            
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="ai"><BrainCircuit className="mr-2 h-4 w-4"/>AI Generate</TabsTrigger>
                                    <TabsTrigger value="pdf"><UploadCloud className="mr-2 h-4 w-4"/> Upload File</TabsTrigger>
                                    <TabsTrigger value="link"><LinkIcon className="mr-2 h-4 w-4"/> G-Drive Link</TabsTrigger>
                                </TabsList>
                                <TabsContent value="ai" className="pt-4 text-center">
                                    <Card className="bg-primary/5 border-dashed">
                                        <CardContent className="p-4">
                                            <p className="text-sm text-muted-foreground">The AI will generate the note content based on the Title/Topic you entered above. No need to add anything here.</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="pdf" className="pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="noteFile">Note File</Label>
                                        <Input 
                                            id="noteFile" 
                                            name="noteFile" 
                                            type="file" 
                                            accept=".pdf,.doc,.docx,.ppt,.pptx" 
                                            disabled={isSubmitting} 
                                        />
                                        <p className="text-xs text-muted-foreground">Supports PDF, Word, and PowerPoint files.</p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="link" className="pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="driveLink">Note Google Drive Link</Label>
                                        <Input 
                                            id="driveLink" 
                                            name="driveLink"
                                            placeholder="https://docs.google.com/..." 
                                            disabled={isSubmitting} 
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="isPremium" name="isPremium" disabled={isSubmitting}/>
                                <Label htmlFor="isPremium">Mark as Premium</Label>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                {isSubmitting ? currentSubmissionMessage : 'Add Note'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
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

    
