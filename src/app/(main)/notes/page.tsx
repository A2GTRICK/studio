
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Gem, Lock, ArrowRight, Check, ShoppingCart, Loader2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PaymentDialog } from '@/components/payment-dialog';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { AiImage } from '@/components/ai-image';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export type Note = {
  id: string;
  title: string;
  course: string;
  year: string;
  subject: string;
  isPremium: boolean;
  content: string; 
  price?: string;
  thumbnail?: string;
  createdAt: any;
};

const premiumFeatures = [
    "Access to ALL detailed library notes",
    "AI Note & Exam Question Generation",
    "Ask follow-up questions to our AI Tutor",
    "In-depth competitive exam preparation",
];

const loadingMessages = [
    "Poori library scan kar rahe hain, aapke liye...",
    "Notes ke pannon ko palat rahe hain...",
    "Finding the shiniest notes for you... ✨",
    "Hold on, dusting off the shelves!",
];

const NoteCardSkeleton = () => (
    <Card className="flex flex-col overflow-hidden">
        <div className="p-4 flex flex-col flex-grow">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-8 w-full" />
            <div className="flex-grow" />
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    </Card>
);


const NoteCard = ({ note, onUnlockClick }: { note: Note; onUnlockClick: () => void; }) => {
    const { id, title, course, year, subject, isPremium, content, price } = note;
    
    const isExternalLink = content.startsWith('http');

    let actionButton;

    if (isPremium) {
         actionButton = (
            <Button onClick={onUnlockClick} className="w-full" variant="outline">
                <Lock className="mr-2 h-4 w-4" />
                Unlock Note
            </Button>
        );
    } else if (isExternalLink) {
        actionButton = (
            <Button asChild className="w-full">
                <a href={content} target="_blank" rel="noopener noreferrer">
                    Open Note <ExternalLink className="ml-2 h-4 w-4"/>
                </a>
            </Button>
        );
    } else {
        actionButton = (
            <Button asChild className="w-full">
                <Link href={`/notes/${id}`}>
                    View Note <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
        );
    }

    return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col group overflow-hidden">
        <div className="p-4 flex flex-col flex-grow">
            <CardHeader className="p-0">
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <span>{course}</span>
                  <span>&bull;</span>
                  <span>{year}</span>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                 <p className="text-sm text-muted-foreground line-clamp-2">
                    {isExternalLink 
                        ? "This is an external document. Click below to open it in a new tab." 
                        : "These are detailed notes available to view directly inside the app."
                    }
                 </p>
            </CardContent>
            <CardFooter className="p-0 pt-4 mt-auto">
                {actionButton}
            </CardFooter>
        </div>
    </Card>
)};

export default function NotesPage() {
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        course: 'All',
        year: 'All',
        subject: 'All'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
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
            setAllNotes(notesList);
        } catch (error) {
            console.error("Error fetching notes:", error);
            // In a real app, you might want to show a toast here.
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch notes only if they haven't been loaded yet.
        if (allNotes.length === 0) {
            fetchNotes();
        }
    }, [allNotes.length, fetchNotes]);

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

    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev, [filterName]: value };
            if (filterName === 'course') {
                newFilters.year = 'All';
            }
            return newFilters;
        });
    };
    
    const getUniqueValues = useCallback((key: 'course' | 'year' | 'subject', notes: Note[]) => {
        const values = new Set(notes.map(note => note[key]));
        return ['All', ...Array.from(values).sort()];
    }, []);

    const courses = useMemo(() => getUniqueValues('course', allNotes), [allNotes, getUniqueValues]);
    
    const years = useMemo(() => {
        const notesForYearFilter = filters.course === 'All'
            ? allNotes
            : allNotes.filter(note => note.course === filters.course);
        return getUniqueValues('year', notesForYearFilter);
    }, [filters.course, allNotes, getUniqueValues]);

    const subjects = useMemo(() => {
        let notesForSubjectFilter = allNotes;
        if (filters.course !== 'All') {
            notesForSubjectFilter = notesForSubjectFilter.filter(note => note.course === filters.course);
        }
        if (filters.year !== 'All') {
            notesForSubjectFilter = notesForSubjectFilter.filter(note => note.year === filters.year);
        }
        return getUniqueValues('subject', notesForSubjectFilter);
    }, [filters.course, filters.year, allNotes, getUniqueValues]);


    const filteredNotes = useMemo(() => {
        return allNotes.filter(note => {
            const courseMatch = filters.course === 'All' || note.course === filters.course;
            const yearMatch = filters.year === 'All' || note.year === filters.year;
            const subjectMatch = filters.subject === 'All' || note.subject === filters.subject;
            const searchMatch = !debouncedSearchQuery || 
                note.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                note.subject.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
            
            return courseMatch && yearMatch && subjectMatch && searchMatch;
        });
    }, [filters, debouncedSearchQuery, allNotes]);


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
                <Select value={filters.course} onValueChange={(value) => handleFilterChange('course', value)}>
                    <SelectTrigger id="course-filter" aria-label="Filter by Course"><SelectValue placeholder="Filter by Course" /></SelectTrigger>
                    <SelectContent>
                        {courses.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                    <SelectTrigger id="year-filter" aria-label="Filter by Year"><SelectValue placeholder="Filter by Year" /></SelectTrigger>
                    <SelectContent>
                        {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 <div className="lg:col-span-full text-center py-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground animate-pulse">{currentLoadingMessage}</p>
                 </div>
                 {Array.from({ length: 8 }).map((_, i) => (
                    <NoteCardSkeleton key={i} />
                ))}
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
                    Buy Just This Note for INR {selectedNote?.price || '19'}
                </Button>
            </div>
        </DialogContent>
    </Dialog>
    
    <PaymentDialog 
        isOpen={showPaymentDialog} 
        setIsOpen={setShowPaymentDialog}
        title={`Buy "${selectedNote?.title}"`}
        price={`INR ${selectedNote?.price || '19'}`}
        onPaymentSuccess={() => {
            if (selectedNote) {
            }
            setShowPaymentDialog(false);
            setSelectedNote(null);
        }}
    />
    </>
  )
}
