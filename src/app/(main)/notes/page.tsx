
'use client';

import { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Gem } from "lucide-react";

// --- ACCURATE PLACEHOLDER DATA based on Pharmacy Curriculum ---
const notesData = [
  // B.Pharm 1st Year
  { id: 1, title: "Human Anatomy and Physiology I", course: "B.Pharm", year: "1st Year", subject: "HAP I", isPremium: false, preview: "Cellular level of organization, tissues, osseous system, blood, and lymphatic system." },
  { id: 2, title: "Pharmaceutical Analysis I", course: "B.Pharm", year: "1st Year", subject: "Analysis", isPremium: true, preview: "Different techniques of pharmaceutical analysis, errors, acid-base titration, and non-aqueous titrations." },
  { id: 3, title: "Pharmaceutics I", course: "B.Pharm", year: "1st Year", subject: "Pharmaceutics", isPremium: false, preview: "History of pharmacy, dosage forms, prescriptions, and pharmaceutical calculations." },
  { id: 4, title: "Pharmaceutical Inorganic Chemistry", course: "B.Pharm", year: "1st Year", subject: "Chemistry", isPremium: false, preview: "Impurities in pharmaceutical substances, major intra and extracellular electrolytes, and dental products." },
  
  // B.Pharm 2nd Year
  { id: 5, title: "Physical Pharmaceutics I", course: "B.Pharm", year: "2nd Year", subject: "Pharmaceutics", isPremium: true, preview: "Solubility of drugs, states of matter, physicochemical properties of drug molecules." },
  { id: 6, title: "Pharmaceutical Organic Chemistry II", course: "B.Pharm", year: "2nd Year", subject: "Chemistry", isPremium: false, preview: "Benzene and its derivatives, phenols, aromatic amines, and aromatic acids." },
  { id: 7, title: "Biochemistry", course: "B.Pharm", year: "2nd Year", subject: "Biochemistry", isPremium: true, preview: "Biomolecules, bioenergetics, carbohydrate metabolism, and biological oxidation." },
  { id: 8, title: "Pathophysiology", course: "B.Pharm", year: "2nd Year", subject: "Pathophysiology", isPremium: false, preview: "Basic principles of cell injury and adaptation, inflammation, and cardiovascular system diseases." },

  // B.Pharm 3rd Year
  { id: 9, title: "Medicinal Chemistry II", course: "B.Pharm", year: "3rd Year", subject: "Chemistry", isPremium: true, preview: "Antihistaminic agents, proton pump inhibitors, and drugs acting on the endocrine system." },
  { id: 10, title: "Pharmacology II", course: "B.Pharm", year: "3rd Year", subject: "Pharmacology", isPremium: false, preview: "Pharmacology of drugs acting on the cardiovascular system, urinary system, and GIT." },

  // B.Pharm 4th Year
  { id: 11, title: "Novel Drug Delivery Systems", course: "B.Pharm", year: "4th Year", subject: "Pharmaceutics", isPremium: true, preview: "Controlled drug delivery, microencapsulation, transdermal drug delivery systems, and targeted delivery." },
  { id: 12, title: "Pharmacy Practice", course: "B.Pharm", year: "4th Year", subject: "Pharmacy Practice", isPremium: false, preview: "Hospital and its organization, drug distribution system in a hospital, and clinical pharmacy." },

  // D.Pharm 1st Year
  { id: 13, title: "Introduction to Pharmacognosy", course: "D.Pharm", year: "1st Year", subject: "Pharmacognosy", isPremium: false, preview: "Definition, history, scope, and various systems of classification of crude drugs." },
  { id: 14, title: "Biochemistry & Clinical Pathology", course: "D.Pharm", year: "1st Year", subject: "Biochemistry", isPremium: true, preview: "Introduction to biochemistry, carbohydrates, lipids, proteins, vitamins, and enzymes." },

  // D.Pharm 2nd Year
  { id: 15, title: "Pharmacotherapeutics", course: "D.Pharm", year: "2nd Year", subject: "Pharmacotherapeutics", isPremium: false, preview: "Cardiovascular disorders, respiratory diseases, and infectious diseases." },
  { id: 16, title: "Hospital and Clinical Pharmacy", course: "D.Pharm", year: "2nd Year", subject: "Clinical Pharmacy", isPremium: true, preview: "Hospital pharmacy organization, drug distribution systems, and medication errors." },
];

const NoteCard = ({ title, subject, isPremium, preview }: { title: string; subject: string; isPremium: boolean; preview: string; }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-background flex flex-col">
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
    </Card>
);

export default function NotesPage() {
    const [courseFilter, setCourseFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

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
