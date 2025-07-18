'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

// Placeholder data
const notesData = {
  "B.Pharm": {
    "1st Year": {
      "Semester 1": [
        { id: 1, title: "Introduction to Pharmaceutics", subject: "Pharmaceutics", isPremium: false, preview: "Basic concepts of dosage forms and drug delivery systems..." },
        { id: 2, title: "Pharmaceutical Inorganic Chemistry", subject: "Chemistry", isPremium: true, preview: "A detailed study of inorganic compounds used in pharmacy..." },
      ],
      "Semester 2": [
        { id: 3, title: "Human Anatomy and Physiology I", subject: "HAP", isPremium: false, preview: "Exploring the structure and function of the human body..." },
      ],
    },
    "2nd Year": {
      "Semester 3": [
         { id: 4, title: "Physical Pharmaceutics I", subject: "Pharmaceutics", isPremium: true, preview: "Study of physicochemical principles of pharmacy..." },
      ],
    },
  },
  "D.Pharm": {
    "1st Year": [
        { id: 5, title: "Pharmacognosy Basics", subject: "Pharmacognosy", isPremium: false, preview: "Introduction to crude drugs from natural sources..." },
    ]
  }
};

const NoteCard = ({ title, subject, isPremium, preview }: { title: string; subject: string; isPremium: boolean; preview: string; }) => (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-background">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-lg">{title}</CardTitle>
                    <CardDescription>{subject}</CardDescription>
                </div>
                {isPremium ? <Badge variant="default" className="bg-accent text-accent-foreground">Premium</Badge> : <Badge variant="secondary">Free</Badge>}
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">{preview}</p>
        </CardContent>
    </Card>
);


export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">Notes Library</h1>
        <p className="text-muted-foreground">Find all your study materials, perfectly organized.</p>
      </div>
      
      <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select>
                    <SelectTrigger><SelectValue placeholder="Filter by Course" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="b-pharm">B.Pharm</SelectItem>
                        <SelectItem value="d-pharm">D.Pharm</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger><SelectValue placeholder="Filter by Year" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1st-year">1st Year</SelectItem>
                        <SelectItem value="2nd-year">2nd Year</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger><SelectValue placeholder="Filter by Subject" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pharmaceutics">Pharmaceutics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                    </SelectContent>
                </Select>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search notes..." className="pl-10" />
                </div>
            </div>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["B.Pharm"]} className="w-full space-y-4">
        {Object.entries(notesData).map(([course, years]) => (
          <AccordionItem key={course} value={course} className="border-none">
            <AccordionTrigger className="text-2xl font-headline bg-card p-4 rounded-lg hover:no-underline">
              {course}
            </AccordionTrigger>
            <AccordionContent className="p-2">
              <Accordion type="multiple" className="w-full space-y-2">
                 {Object.entries(years).map(([year, semestersOrNotes]) => (
                    <AccordionItem key={year} value={year} className="border-none">
                       <AccordionTrigger className="text-xl font-headline bg-card/70 p-3 rounded-lg hover:no-underline">
                           {year}
                       </AccordionTrigger>
                       <AccordionContent className="p-2">
                           {Array.isArray(semestersOrNotes) ? (
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                   {semestersOrNotes.map(note => <NoteCard key={note.id} {...note} />)}
                               </div>
                           ) : (
                               <Accordion type="multiple" defaultValue={["Semester 1"]} className="w-full space-y-2">
                                   {Object.entries(semestersOrNotes).map(([semester, notes]) => (
                                       <AccordionItem key={semester} value={semester} className="border-none">
                                           <AccordionTrigger className="text-lg font-headline bg-card/50 p-3 rounded-lg hover:no-underline">{semester}</AccordionTrigger>
                                           <AccordionContent className="pt-4">
                                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                   {notes.map(note => <NoteCard key={note.id} {...note} />)}
                                               </div>
                                           </AccordionContent>
                                       </AccordionItem>
                                   ))}
                               </Accordion>
                           )}
                       </AccordionContent>
                    </AccordionItem>
                 ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
