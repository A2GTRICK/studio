
import { fetchAllNotes } from "@/services/notes";
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from "next/navigation";

type Props = {
  params: { course: string; year: string; subject: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = decodeURIComponent(params.course);
  const year = decodeURIComponent(params.year);
  const subject = decodeURIComponent(params.subject);
  
  return {
    title: `${subject} Notes | ${course} ${year} | pharmA2G`,
    description: `Find ${subject} notes for ${course} ${year}. Exam-focused content for GPAT and university syllabus.`,
  };
}

export default async function NotesListPage({ params }: Props) {
    const notes = await fetchAllNotes();
    const decodedCourse = decodeURIComponent(params.course);
    const decodedYear = decodeURIComponent(params.year);
    const decodedSubject = decodeURIComponent(params.subject);

    const filteredNotes = notes.filter(n => 
        n.course === decodedCourse && 
        n.year === decodedYear && 
        n.subject === decodedSubject
    );

    if (filteredNotes.length === 0) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Subject: {decodedSubject}</h1>
             <p className="mt-2 text-muted-foreground">
                Showing notes for {decodedCourse} - {decodedYear}.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredNotes.map(note => (
                    <Link key={note.id} href={`/notes/${params.course}/${params.year}/${params.subject}/${note.id}`} className="p-6 border rounded-lg hover:bg-secondary">
                        <h2 className="font-semibold text-lg">{note.title}</h2>
                        <p className="text-sm text-muted-foreground line-clamp-2">{note.short}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
