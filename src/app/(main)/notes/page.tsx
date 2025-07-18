
'use client';

import { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Gem, Lock, ArrowRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// --- ACCURATE PLACEHOLDER DATA based on Pharmacy Curriculum ---
const notesData = [
  // B.Pharm 1st Year
  { id: 1, title: "Human Anatomy and Physiology I", course: "B.Pharm", year: "1st Year", subject: "HAP I", isPremium: false, preview: "Cellular level of organization, tissues, osseous system, blood, and lymphatic system." },
  { id: 2, title: "Pharmaceutical Analysis I", course: "B.Pharm", year: "1st Year", subject: "Analysis", isPremium: true, preview: "Unlock detailed notes on different techniques of pharmaceutical analysis, errors, acid-base titration, and non-aqueous titrations." },
  { id: 3, title: "Pharmaceutics I", course: "B.Pharm", year: "1st Year", subject: "Pharmaceutics", isPremium: false, preview: "History of pharmacy, dosage forms, prescriptions, and pharmaceutical calculations." },
  { id: 4, title: "Pharmaceutical Inorganic Chemistry", course: "B.Pharm", year: "1st Year", subject: "Chemistry", isPremium: false, preview: "Impurities in pharmaceutical substances, major intra and extracellular electrolytes, and dental products." },
  
  // B.Pharm 2nd Year
  { id: 5, title: "Physical Pharmaceutics I", course: "B.Pharm", year: "2nd Year", subject: "Pharmaceutics", isPremium: true, preview: "Premium content on solubility of drugs, states of matter, and physicochemical properties of drug molecules." },
  { id: 6, title: "Pharmaceutical Organic Chemistry II", course: "B.Pharm", year: "2nd Year", subject: "Chemistry", isPremium: false, preview: "Benzene and its derivatives, phenols, aromatic amines, and aromatic acids." },
  { id: 7, title: "Biochemistry", course: "B.Pharm", year: "2nd Year", subject: "Biochemistry", isPremium: true, preview: "Get exclusive access to notes on biomolecules, bioenergetics, carbohydrate metabolism, and biological oxidation." },
  { id: 8, title: "Pathophysiology", course: "B.Pharm", year: "2nd Year", subject: "Pathophysiology", isPremium: false, preview: "Basic principles of cell injury and adaptation, inflammation, and cardiovascular system diseases." },

  // B.Pharm 3rd Year
  { id: 9, title: "Medicinal Chemistry II", course: "B.Pharm", year: "3rd Year", subject: "Chemistry", isPremium: true, preview: "Detailed notes on antihistaminic agents, proton pump inhibitors, and drugs acting on the endocrine system." },
  { id: 10, title: "Pharmacology II", course: "B.Pharm", year: "3rd Year", subject: "Pharmacology", isPremium: false, preview: "Pharmacology of drugs acting on the cardiovascular system, urinary system, and GIT." },

  // B.Pharm 4th Year
  { id: 11, title: "Novel Drug Delivery Systems", course: "B.Pharm", year: "4th Year", subject: "Pharmaceutics", isPremium: true, preview: "Explore controlled drug delivery, microencapsulation, transdermal drug delivery systems, and targeted delivery." },
  { id: 12, title: "Pharmacy Practice", course: "B.Pharm", year: "4th Year", subject: "Pharmacy Practice", isPremium: false, preview: "Hospital and its organization, drug distribution system in a hospital, and clinical pharmacy." },

  // D.Pharm 1st Year
  { id: 13, title: "Introduction to Pharmacognosy", course: "D.Pharm", year: "1st Year", subject: "Pharmacognosy", isPremium: false, preview: "Definition, history, scope, and various systems of classification of crude drugs." },
  { id: 14, title: "Biochemistry & Clinical Pathology", course: "D.Pharm", year: "1st Year", subject: "Biochemistry", isPremium: true, preview: "Upgrade to access notes on introduction to biochemistry, carbohydrates, lipids, proteins, vitamins, and enzymes." },

  // D.Pharm 2nd Year
  { id: 15, title: "Pharmacotherapeutics", course: "D.Pharm", year: "2nd Year", subject: "Pharmacotherapeutics", isPremium: false, preview: "Cardiovascular disorders, respiratory diseases, and infectious diseases." },
  { id: 16, title: "Hospital and Clinical Pharmacy", course: "D.Pharm", year: "2nd Year", subject: "Clinical Pharmacy", isPremium: true, preview: "Complete notes on hospital pharmacy organization, drug distribution systems, and medication errors." },
];

const premiumFeatures = [
    "Access to ALL detailed library notes",
    "AI Note & Exam Question Generation",
    "Ask follow-up questions to our AI Tutor",
    "In-depth competitive exam preparation",
];

const NoteCard = ({ note, onPremiumClick }: { note: typeof notesData[0]; onPremiumClick: () => void; }) => {
    const { title, subject, isPremium, preview } = note;
    
    const handleCardClick = () => {
        if (isPremium) {
            onPremiumClick();
        } else {
            // Placeholder for navigating to the actual note page for free notes
            alert(`Navigating to: ${title}`);
        }
    };
    
    return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col group">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-lg">{title}</CardTitle>
                    <CardDescription>{subject}</CardDescription>
                </div>
                {isPremium ? 
                    <Badge variant="default" className="bg-accent text-accent-foreground flex items-center gap-1">
                        <Gem className="h-3 w-3" />
                        Premium
                    </Badge> : <Badge variant="secondary">Free</Badge>}
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">{preview}</p>
        </CardContent>
        <CardFooter>
            <Button onClick={handleCardClick} className="w-full" variant={isPremium ? "outline" : "default"}>
                 {isPremium ? <Lock className="mr-2 h-4 w-4" /> : null}
                 {isPremium ? "Unlock Note" : "View Note"}
            </Button>
        </CardFooter>
    </Card>
)};


export default function NotesPage() {
    const [courseFilter, setCourseFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPremiumDialog, setShowPremiumDialog] = useState(false);

    const getUniqueValues = (key: 'course' | 'year' | 'subject') => {
        const values = new Set(notesData.map(note => note[key]));
        return ['All', ...Array.from(values).sort()];
    };

    const courses = useMemo(() => getUniqueValues('course'), []);
    const years = useMemo(() => {
        if (courseFilter === 'All') return getUniqueValues('year');
        const relevantYears = new Set(notesData.filter(note => note.course === courseFilter).map(note => note.year));
        return ['All', ...Array.from(relevantYears).sort()];
    }, [courseFilter]);

    const subjects = useMemo(() => {
        if (courseFilter === 'All' && yearFilter === 'All') return getUniqueValues('subject');
        
        const filteredByCourse = courseFilter === 'All' ? notesData : notesData.filter(note => note.course === courseFilter);
        const filteredByYear = yearFilter === 'All' ? filteredByCourse : filteredByCourse.filter(note => note.year === yearFilter);

        const relevantSubjects = new Set(filteredByYear.map(note => note.subject));
        return ['All', ...Array.from(relevantSubjects).sort()];
    }, [courseFilter, yearFilter]);

    const filteredNotes = useMemo(() => {
        let notes = notesData;

        if (courseFilter !== 'All') {
            notes = notes.filter(note => note.course === courseFilter);
        }
        if (yearFilter !== 'All') {
            notes = notes.filter(note => note.year === yearFilter);
        }
        if (subjectFilter !== 'All') {
            notes = notes.filter(note => note.subject === subjectFilter);
        }
        if (searchQuery) {
            notes = notes.filter(note => 
                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.subject.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        return notes;
    }, [courseFilter, yearFilter, subjectFilter, searchQuery]);

    // Reset dependent filters when a primary filter changes
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
        {filteredNotes.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredNotes.map(note => <NoteCard key={note.id} note={note} onPremiumClick={() => setShowPremiumDialog(true)} />)}
             </div>
        ) : (
            <Card className="mt-8">
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <BookOpen className="h-20 w-20 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-semibold">No Notes Found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
    <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Gem className="h-6 w-6 text-primary" />
                </div>
                <DialogTitle className="text-center font-headline text-2xl">Unlock This Note & More!</DialogTitle>
                <DialogDescription className="text-center text-base">
                   This note is part of our premium collection. Upgrade to get instant access.
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
                <Button size="lg" variant="ghost" onClick={() => setShowPremiumDialog(false)}>Maybe Later</Button>
            </div>
        </DialogContent>
    </Dialog>
    </>
  )
}
