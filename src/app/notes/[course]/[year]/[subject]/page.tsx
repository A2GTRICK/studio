import { fetchAllNotes } from "@/services/notes";
import Link from 'next/link';
import { Metadata } from 'next';

type Props = {
  params: { course: string; year: string; subject: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = decodeURIComponent(params.course);
  const year = decodeURIComponent(params.year);
  const subject = decodeURIComponent(params.subject);
  
  return {
    title: `${subject} Notes | ${course} ${year} | A2G`,
    description: `Find ${subject} notes for ${course} ${year}. Exam-focused content for GPAT and university syllabus.`,
  };
}

export default async function NotesListPage({ params }: Props) {
    const notes = await fetchAllNotes();
    const filteredNotes = notes.filter(n => n.course === params.course && n.year === params.year && n.subject === params.subject);

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Subject: {decodeURIComponent(params.subject)}</h1>
             <p className="mt-2 text-muted-foreground">
                Showing notes for {decodeURIComponent(params.course)} - {decodeURIComponent(params.year)}.
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
