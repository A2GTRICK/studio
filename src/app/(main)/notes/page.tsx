
'use client';

import { useState, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen } from "lucide-react";

// --- EXPANDED PLACEHOLDER DATA ---
const notesData = [
    { id: 1, title: "Introduction to Dosage Forms", course: "B.Pharm", year: "1st Year", subject: "Pharmaceutics", isPremium: false, preview: "Basic concepts of dosage forms and drug delivery systems..." },
    { id: 2, title: "Pharmaceutical Inorganic Chemistry", course: "B.Pharm", year: "1st Year", subject: "Chemistry", isPremium: true, preview: "A detailed study of inorganic compounds used in pharmacy..." },
    { id: 3, title: "Human Anatomy and Physiology I", course: "B.Pharm", year: "1st Year", subject: "HAP", isPremium: false, preview: "Exploring the structure and function of the human body..." },
    { id: 4, title: "Physical Pharmaceutics I", course: "B.Pharm", year: "2nd Year", subject: "Pharmaceutics", isPremium: true, preview: "Study of physicochemical principles of pharmacy..." },
    { id: 5, title: "Pharmacognosy Basics", course: "D.Pharm", year: "1st Year", subject: "Pharmacognosy", isPremium: false, preview: "Introduction to crude drugs from natural sources..." },
    { id: 6, title: "Organic Chemistry II", course: "B.Pharm", year: "2nd Year", subject: "Chemistry", isPremium: false, preview: "Advanced topics in organic chemistry relevant to pharmacy." },
    { id: 7, title: "Biochemistry", course: "B.Pharm", year: "2nd Year", subject: "Biochemistry", isPremium: true, preview: "The chemical processes within and relating to living organisms." },
    { id: 8, title: "Hospital and Clinical Pharmacy", course: "D.Pharm", year: "2nd Year", subject: "Clinical Pharmacy", isPremium: true, preview: "An introduction to pharmacy practice in hospital settings." },
    { id: 9, title: "Pharmacology II", course: "B.Pharm", year: "3rd Year", subject: "Pharmacology", isPremium: false, preview: "Study of drugs acting on various systems of the body." },
    { id: 10, title: "Medicinal Chemistry I", course: "B.Pharm", year: "3rd Year", subject: "Chemistry", isPremium: true, preview: "Design and synthesis of pharmaceutical agents." },
];

const NoteCard = ({ title, subject, isPremium, preview }: { title: string; subject: string; isPremium: boolean; preview: string; }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-background flex flex-col">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-lg">{title}</CardTitle>
                    <CardDescription>{subject}</CardDescription>
                </div>
                {isPremium ? <Badge variant="default" className="bg-accent text-accent-foreground">Premium</Badge> : <Badge variant="secondary">Free</Badge>}
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">{preview}</p>
        </CardContent>
    </Card>
);


export default function NotesPage() {
    const [courseFilter, setCourseFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const getUniqueValues = (key: 'course' | 'year' | 'subject') => {
        const values = new Set(notesData.map(note => note[key]));
        return ['All', ...Array.from(values)];
    };

    const courses = getUniqueValues('course');
    const years = getUniqueValues('year');
    const subjects = getUniqueValues('subject');

    const filteredNotes = useMemo(() => {
        return notesData.filter(note => {
            const courseMatch = courseFilter === 'All' || note.course === courseFilter;
            const yearMatch = yearFilter === 'All' || note.year === yearFilter;
            const subjectMatch = subjectFilter === 'All' || note.subject === subjectFilter;
            const searchMatch = searchQuery === '' || note.title.toLowerCase().includes(searchQuery.toLowerCase());
            return courseMatch && yearMatch && subjectMatch && searchMatch;
        });
    }, [courseFilter, yearFilter, subjectFilter, searchQuery]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Notes Library</h1>
        <p className="text-muted-foreground">Find all your study materials, perfectly organized.</p>
      </div>
      
      <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Course" /></SelectTrigger>
                    <SelectContent>
                        {courses.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Year" /></SelectTrigger>
                    <SelectContent>
                        {years.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
                    <SelectContent>
                        {subjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search notes by title..." 
                        className="pl-10" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </CardContent>
      </Card>

      <div>
        {filteredNotes.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map(note => <NoteCard key={note.id} {...note} />)}
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
  )
}
