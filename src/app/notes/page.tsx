import { fetchAllNotes } from "@/services/notes";
import Link from 'next/link';

export default async function NotesCoursePage() {
    const notes = await fetchAllNotes();
    const courses = [...new Set(notes.map(note => note.course).filter(Boolean))];

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Notes Library</h1>
            <p className="mt-2 text-muted-foreground">
                Exam-focused pharmacy notes curated as per GPAT and university syllabus.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {courses.map(course => (
                    <Link key={course} href={`/notes/${course}`} className="p-6 border rounded-lg hover:bg-secondary">
                        <h2 className="font-semibold text-lg">{course}</h2>
                    </Link>
                ))}
            </div>
        </div>
    );
}
