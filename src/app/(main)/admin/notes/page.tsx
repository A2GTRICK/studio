
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Edit, Trash2, Loader2, Link as LinkIcon, Upload, BrainCircuit, IndianRupee, Image as ImageIcon } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateNotesFromTopic } from '@/ai/flows/generate-notes-from-topic';
import { useNotes } from '@/context/notes-context';
import type { Note } from '@/context/notes-context';

const submissionMessages = [
    "Details ko verify kar rahe hain...",
    "Note ko library mein save kar rahe hain...",
    "Ek second, bas ho gaya...",
];

const aiSubmissionMessages = [
    "AI ko topic samjha rahe hain...",
    "AI notes likh raha hai...",
    "Notes ko final touch de rahe hain...",
];

const yearOptions: { [key: string]: string[] } = {
    "B.Pharm": ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    "D.Pharm": ["1st Year", "2nd Year"],
};

export default function AdminNotesPage() {
    const { notes, loading, addNote, deleteNote } = useNotes();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [currentSubmissionMessage, setCurrentSubmissionMessage] = useState(submissionMessages[0]);
    const [selectedCourse, setSelectedCourse] = useState<"B.Pharm" | "D.Pharm" | "">("");
    const [activeTab, setActiveTab] = useState('ai-generate');
    const [isPremium, setIsPremium] = useState(false);

     useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSubmitting) {
          const messageArray = activeTab === 'ai-generate' ? aiSubmissionMessages : submissionMessages;
          interval = setInterval(() => {
            setCurrentSubmissionMessage(prev => {
                const nextIndex = (messageArray.indexOf(prev) + 1) % messageArray.length;
                return messageArray[nextIndex];
            });
          }, 2500);
        }
        return () => clearInterval(interval);
    }, [isSubmitting, activeTab]);
    

    const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = e.currentTarget;
        const formData = new FormData(form);
        
        const isPremiumChecked = formData.get('isPremium') === 'on';

        const baseNoteDetails = {
            title: formData.get('title') as string,
            course: formData.get('course') as string,
            year: formData.get('year') as string,
            subject: formData.get('subject') as string,
            thumbnail: formData.get('thumbnail') as string,
            isPremium: isPremiumChecked,
            price: isPremiumChecked ? (formData.get('price') as string) : undefined,
        };

        if (!baseNoteDetails.title || !baseNoteDetails.course || !baseNoteDetails.year || !baseNoteDetails.subject) {
            toast({ title: "Core Fields Required", description: "Please fill out Title, Course, Year, and Subject.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        if (isPremiumChecked && (!baseNoteDetails.price || Number(baseNoteDetails.price) <= 0)) {
            toast({ title: "Invalid Price", description: "Premium notes must have a valid price.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        try {
            let noteContent = '';

            if (activeTab === 'ai-generate') {
                setCurrentSubmissionMessage(aiSubmissionMessages[0]);
                const result = await generateNotesFromTopic({
                    course: baseNoteDetails.course,
                    year: baseNoteDetails.year,
                    subject: baseNoteDetails.subject,
                    topic: baseNoteDetails.title,
                });
                noteContent = result.notes;
            } else if (activeTab === 'upload-file') {
                setCurrentSubmissionMessage(submissionMessages[0]);
                const file = formData.get('fileUpload') as File;
                if (!file || file.size === 0) {
                    toast({ title: "File Required", description: "Please select a file to upload.", variant: "destructive" });
                    setIsSubmitting(false);
                    return;
                }
                noteContent = `File Uploaded: ${file.name}`; // In a real app, you'd upload this file.
            } else { // g-drive-link
                setCurrentSubmissionMessage(submissionMessages[0]);
                const driveLink = formData.get('driveLink') as string;
                 if (!driveLink) {
                    toast({ title: "Link Required", description: "Please enter a Google Drive link.", variant: "destructive" });
                    setIsSubmitting(false);
                    return;
                }
                noteContent = driveLink;
            }

            const noteToAdd: Omit<Note, 'id' | 'createdAt'> = {
                ...baseNoteDetails,
                content: noteContent,
            };
            
            await addNote(noteToAdd);

            toast({
                title: "Note Added Successfully!",
                description: `"${baseNoteDetails.title}" has been added to the library.`
            });
            form.reset();
            setSelectedCourse("");
            setIsPremium(false);
            setIsSubmitting(false); // Reset submitting state on success
            
        } catch (error: any) {
            console.error("Error adding note:", error);
            toast({
                title: "Error adding note",
                description: error.message || "There was a problem saving the note.",
                variant: "destructive"
            });
            setIsSubmitting(false); // Also reset on error
        }
    };
    
    const handleDeleteNote = async (noteId: string) => {
        try {
            await deleteNote(noteId);
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
                            <CardDescription>Choose a method to add a new note to the library.</CardDescription>
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
                             <div className="space-y-2">
                                <Label htmlFor="thumbnail">Thumbnail Image URL (Optional)</Label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="thumbnail" name="thumbnail" placeholder="https://postimages.org/..." className="pl-10" disabled={isSubmitting} />
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="isPremium" name="isPremium" onCheckedChange={(checked) => setIsPremium(Boolean(checked))} disabled={isSubmitting}/>
                                    <Label htmlFor="isPremium">Mark as Premium</Label>
                                </div>
                                {isPremium && (
                                    <div className="relative pl-6 pt-2">
                                        <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            placeholder="e.g., 19"
                                            className="pl-10"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <Tabs defaultValue="ai-generate" className="w-full" onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="ai-generate">AI Generate</TabsTrigger>
                                <TabsTrigger value="upload-file">Upload File</TabsTrigger>
                                <TabsTrigger value="g-drive-link">G-Drive Link</TabsTrigger>
                            </TabsList>
                            <TabsContent value="ai-generate">
                                <CardContent className="space-y-2 pt-4">
                                    <div className="p-4 text-center bg-primary/5 rounded-lg border border-primary/20">
                                        <BrainCircuit className="mx-auto h-8 w-8 text-primary mb-2"/>
                                        <p className="text-sm text-muted-foreground">The AI will generate notes based on the <strong>Title/Topic</strong> and <strong>Subject</strong> entered above.</p>
                                    </div>
                                </CardContent>
                            </TabsContent>
                            <TabsContent value="upload-file">
                                 <CardContent className="space-y-2 pt-4">
                                    <Label htmlFor="fileUpload">Upload PDF/DOCX</Label>
                                     <div className="relative">
                                        <Upload className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input id="fileUpload" name="fileUpload" type="file" accept=".pdf,.doc,.docx" className="pl-10" disabled={isSubmitting}/>
                                     </div>
                                </CardContent>
                            </TabsContent>
                            <TabsContent value="g-drive-link">
                                 <CardContent className="space-y-2 pt-4">
                                    <Label htmlFor="driveLink">Note Google Drive Link</Label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input id="driveLink" name="driveLink" placeholder="https://docs.google.com/..." className="pl-10" disabled={isSubmitting} />
                                    </div>
                                </CardContent>
                            </TabsContent>
                             <CardFooter>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    {isSubmitting ? currentSubmissionMessage : 'Add Note'}
                                </Button>
                            </CardFooter>
                        </Tabs>
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
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-48">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="mt-4 text-muted-foreground">Loading notes...</p>
                            </div>
                        ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price</TableHead>
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
                                         <TableCell>
                                            {note.isPremium && note.price ? `INR ${note.price}` : 'N/A'}
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

    