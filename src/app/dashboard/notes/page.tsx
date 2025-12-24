
import React from 'react';
import Link from 'next/link';
import { fetchAllNotes, type Note } from '@/services/notes';
import { BookCopy, Star } from 'lucide-react';

const THEME = {
  pageBg: 'bg-[#F8F5FF]',
  groupCard: 'bg-white rounded-2xl shadow-lg border border-purple-200/60',
  noteCard: 'bg-white rounded-xl shadow-md border border-gray-200/80',
  accent: 'text-purple-700',
  groupHeaderBg: 'bg-purple-50/50',
};

// This is now a Server Component
export default async function NotesLibraryPage(): Promise<JSX.Element> {
  const notes = await fetchAllNotes();

  const groupedBySubject = notes.reduce((acc, note) => {
    const subject = note.subject || 'General';
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const orderedSubjects = Object.keys(groupedBySubject).sort((a, b) => {
    if (a === 'General') return 1;
    if (b === 'General') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className={`${THEME.pageBg} min-h-screen p-4 md:p-6`}>
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <div className="flex items-center gap-3">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white">
                <BookCopy size={24} />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                    Notes Library
                </h1>
                <p className="text-sm text-gray-600">Explore and study from the best curated notes.</p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {orderedSubjects.length === 0 && (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">No Notes Found</h3>
              <p className="text-gray-500 mt-2">The library is currently empty.</p>
            </div>
          )}

          {orderedSubjects.map((subject) => {
            const items = groupedBySubject[subject];
            return (
              <section key={subject} className={THEME.groupCard}>
                <div className={`flex items-center gap-4 p-4 rounded-t-2xl ${THEME.groupHeaderBg} border-b border-purple-200/60`}>
                    <div className="p-2 bg-white rounded-lg border border-purple-200/80">
                      <BookCopy className={`h-5 w-5 ${THEME.accent}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900 text-left">{subject}</h3>
                      <p className="text-xs text-purple-700/80 text-left">{items.length} {items.length === 1 ? 'note' : 'notes'}</p>
                    </div>
                </div>

                <div className="p-4 md:p-6 bg-purple-50/20 grid gap-6" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'}}>
                  {items.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  const { id, title, course, year, isPremium } = note;

  return (
    <article className={`${THEME.noteCard} flex flex-col`}>
      <div className="p-4 flex-grow">
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-semibold text-gray-800 leading-snug pr-2">{title}</h4>
          {isPremium && (
            <div className="flex-shrink-0 p-1.5 rounded-full bg-amber-100" title="Premium Note">
              <Star className="w-4 h-4 text-amber-500" />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">{course} • {year || "—"}</p>
      </div>
      
      <div className="px-4 pb-4 pt-2">
        <Link 
            href={`/dashboard/notes/view/${id}`} 
            className="w-full block text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 hover:opacity-90 shadow-md hover:shadow-lg"
        >
          Open Note
        </Link>
      </div>
    </article>
  );
}
