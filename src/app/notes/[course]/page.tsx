
import { fetchAllNotes } from "@/services/notes";
import Link from 'next/link';

export default async function NotesYearPage({ params }: { params: { course: string } }) {
    const notes = await fetchAllNotes();
    const decodedCourse = decodeURIComponent(params.course);
    const years = [...new Set(notes.filter(n => n.course === decodedCourse).map(n => n.year).filter(Boolean))];

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold">Course: {decodedCourse}</h1>
             <p className="mt-2 text-muted-foreground">
                Select a year to find notes for {decodedCourse}.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {years.map(year => (
                    <Link key={year} href={`/notes/${params.course}/${encodeURIComponent(year)}`} className="p-6 border rounded-lg hover:bg-secondary">
                        <h2 className="font-semibold text-lg">{year}</h2>
                    </Link>
                ))}
            </div>
        </div>
    );
}
