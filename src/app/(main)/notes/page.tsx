
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Gem, Lock, ArrowRight, Check, ShoppingCart, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PaymentDialog } from '@/components/payment-dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { AiImage } from '@/components/ai-image';

export type Note = {
  id: string;
  title: string;
  course: string;
  year: string;
  subject: string;
  isPremium: boolean;
  preview: string;
  createdAt: any;
};

const premiumFeatures = [
    "Access to ALL detailed library notes",
    "AI Note & Exam Question Generation",
    "Ask follow-up questions to our AI Tutor",
    "In-depth competitive exam preparation",
];

const NoteCard = ({ note, onUnlockClick }: { note: Note; onUnlockClick: () => void; }) => {
    const { id, title, subject, isPremium, preview } = note;
    
    return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col group overflow-hidden">
        <CardHeader className="p-0">
             <div className="relative h-40 w-full">
                <AiImage 
                    data-ai-id={`note-thumbnail-${id}`}
                    data-ai-hint="pharmacy textbook"
                    alt={title}
                    fill
                    className="object-cover"
                />
            </div>
        </CardHeader>
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <CardTitle className="font-headline text-lg leading-tight">{title}</CardTitle>
                    <CardDescription>{subject}</CardDescription>
                </div>
                {isPremium ? 
                    <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1 shrink-0">
                        <Gem className="h-3 w-3" />
                        Premium
                    </Badge> : <Badge variant="secondary" className="shrink-0">Free</Badge>}
            </div>
            <CardContent className="p-0 flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
            </CardContent>
            <CardFooter className="p-0 pt-4">
                {isPremium ? (
                    <Button onClick={onUnlockClick} className="w-full" variant="outline">
                        <Lock className="mr-2 h-4 w-4" />
                        Unlock Note
                    </Button>
                ) : (
                    <Button asChild className="w-full">
                        <Link href={`/notes/${id}`}>
                            View Note
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </div>
    </Card>
)};


export default function NotesPage() {
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    
    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        const notesCollection = collection(db, 'notes');
        const q = query(notesCollection, orderBy('createdAt', 'desc'));
        const notesSnapshot = await getDocs(q);
        const notesList = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Note[];
        setAllNotes(notesList);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300); // 300ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);


    const handleUnlockClick = (note: Note) => {
        setSelectedNote(note);
    };

    const handleBuyNow = () => {
        if (selectedNote) {
            setShowPaymentDialog(true);
        }
    };
    
    const getUniqueValues = useCallback((key: 'course' | 'year' | 'subject') => {
        const values = new Set(allNotes.map(note => note[key]));
        return ['All', ...Array.from(values).sort()];
    }, [allNotes]);

    const courses = useMemo(() => getUniqueValues('course'), [getUniqueValues]);
    
    const years = useMemo(() => {
        if (courseFilter === 'All') return getUniqueValues('year');
        const relevantYears = new Set(allNotes.filter(note => note.course === courseFilter).map(note => note.year));
        return ['All', ...Array.from(relevantYears).sort()];
    }, [courseFilter, getUniqueValues, allNotes]);

    const subjects = useMemo(() => {
        if (courseFilter === 'All' && yearFilter === 'All') return getUniqueValues('subject');
        
        const filteredByCourse = courseFilter === 'All' ? allNotes : allNotes.filter(note => note.course === courseFilter);
        const filteredByYear = yearFilter === 'All' ? filteredByCourse : filteredByCourse.filter(note => note.year === yearFilter);

        const relevantSubjects = new Set(filteredByYear.map(note => note.subject));
        return ['All', ...Array.from(relevantSubjects).sort()];
    }, [courseFilter, yearFilter, getUniqueValues, allNotes]);


    const filteredNotes = useMemo(() => {
        let notes = allNotes;

        if (courseFilter !== 'All') {
            notes = notes.filter(note => note.course === courseFilter);
        }
        if (yearFilter !== 'All') {
            notes = notes.filter(note => note.year === yearFilter);
        }
        if (subjectFilter !== 'All') {
            notes = notes.filter(note => note.subject === subjectFilter);
        }
        if (debouncedSearchQuery) {
            notes = notes.filter(note => 
                note.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                note.subject.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
            );
        }
        
        return notes;
    }, [courseFilter, yearFilter, subjectFilter, debouncedSearchQuery, allNotes]);

    const handleCourseChange = (value: string) => {
        setCourseFilter(value);
        setYearFilter('All');
        setSubjectFilter('All');
    };

    const handleYearChange = (value: string) => {
        setYearFilter(value);
        setSubjectFilter('All');
    };

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Notes Library</h1>
        <p className="text-muted-foreground">Find all your study materials, perfectly organized.</p>
      </div>
      
      <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={courseFilter} onValueChange={handleCourseChange}>
                    <SelectTrigger id="course-filter" aria-label="Filter by Course"><SelectValue placeholder="Filter by Course" /></SelectTrigger>
                    <SelectContent>
                        {courses.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={handleYearChange}>
                    <SelectTrigger id="year-filter" aria-label="Filter by Year"><SelectValue placeholder="Filter by Year" /></SelectTrigger>
                    <SelectContent>
                        {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger id="subject-filter" aria-label="Filter by Subject"><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
                    <SelectContent>
                        {subjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by title or subject..." 
                        className="pl-10" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search notes"
                    />
                </div>
            </div>
        </CardContent>
      </Card>

      <div>
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : filteredNotes.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNotes.map(note => <NoteCard key={note.id} note={note} onUnlockClick={() => handleUnlockClick(note)} />)}
             </div>
        ) : (
            <Card className="mt-8">
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-20 w-20 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold">No Notes Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for, or check back later!</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
    
    <Dialog open={!!selectedNote} onOpenChange={(isOpen) => !isOpen && setSelectedNote(null)}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Gem className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-center font-headline text-2xl">Unlock "{selectedNote?.title}"</DialogTitle>
                <DialogDescription className="text-center text-base">
                   Choose how you want to access this premium note.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <p className="font-semibold mb-3">Premium benefits include:</p>
                <ul className="space-y-3">
                    {premiumFeatures.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-2">
                <Button asChild size="lg">
                    <Link href="/premium">Upgrade to Premium <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" onClick={handleBuyNow}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy Just This Note for ₹19
                </Button>
            </div>
        </DialogContent>
    </Dialog>
    
    <PaymentDialog 
        isOpen={showPaymentDialog} 
        setIsOpen={setShowPaymentDialog}
        title={`Buy "${selectedNote?.title}"`}
        price="₹19"
        onPaymentSuccess={() => {
            setShowPaymentDialog(false);
            setSelectedNote(null);
        }}
    />
    </>
  )
}
