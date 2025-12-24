import { fetchAllNotes } from "@/services/notes";
import Link from 'next/link';
import { Metadata } from 'next';

type Props = {
  params: { course: string; year: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = decodeURIComponent(params.course);
  const year = decodeURIComponent(params.year);
  
  return {
    title: `${course} ${year} Notes | A2G`,
    description: `Browse subjects for ${course} ${year}. Exam-focused notes for GPAT and university syllabus.`,
  };
}

export default async function NotesSubjectPage({ params }: Props) {
    const notes = await fetchAllNotes();
    const subjects = [...new Set(notes.filter(n => n.course === params.course && n.year === params.year).map(n => n.subject).filter(Boolean))];

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Course: {decodeURIComponent(params.course)} - {decodeURIComponent(params.year)}</h1>
            <p className="mt-2 text-muted-foreground">
                Select a subject to find notes.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {subjects.map(subject => (
                    <Link key={subject} href={`/notes/${params.course}/${params.year}/${subject}`} className="p-6 border rounded-lg hover:bg-secondary">
                        <h2 className="font-semibold text-lg">{subject}</h2>
                    </Link>
                ))}
            </div>
        </div>
    );
}
