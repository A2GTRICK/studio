
import React from 'react';
import Link from 'next/link';
import { fetchAllNotes, type Note } from '@/services/notes';
import { ChevronDown } from 'lucide-react';

const THEME = {
  pageBg: 'bg-[#F8F5FF]',
  card: 'bg-white rounded-2xl shadow-lg border border-[#EDE1FF]',
  accent: 'text-[#6B21A8]',
  groupHeaderBg: 'bg-[#F9F6FF]',
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
    <div className={`${THEME.pageBg} min-h-screen p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white text-lg">
              📚
            </span>
            <span>Notes Library</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Explore and study from the best curated notes.</p>
        </header>

        {/* Filters can be re-implemented here with client components and query params if needed */}

        <div className="space-y-6">
          {orderedSubjects.length === 0 && (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">No Notes Found</h3>
              <p className="text-gray-500 mt-2">The library is currently empty.</p>
            </div>
          )}

          {orderedSubjects.map((subject) => {
            const items = groupedBySubject[subject];
            return (
              <section key={subject} className="bg-white rounded-xl border border-purple-200/80 shadow-sm overflow-hidden">
                <div className={`w-full flex items-center justify-between p-4 ${THEME.groupHeaderBg} border-b border-purple-200/80`}>
                  <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-purple-900 text-left">{subject}</h3>
                        <p className="text-sm text-purple-700/80 text-left">{items.length} {items.length === 1 ? 'note' : 'notes'}</p>
                      </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 bg-purple-50/20">
                    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                      {items.map((note) => (
                        <NoteCard key={note.id} note={note} />
                      ))}
                    </div>
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
  const { id, title, course, year, isPremium, short } = note;

  return (
    <article className={`group bg-white rounded-xl shadow-sm border border-purple-200/60 transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 flex flex-col`}>
      <div className="p-4 flex-grow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 leading-tight truncate pr-2">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">{course} • {year || "—"}</p>
          </div>
          {isPremium && (
            <div className="flex-shrink-0 p-1 rounded-full bg-gradient-to-br from-yellow-100 to-amber-200" title="Premium Note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2 6h6l-4.8 3.2L18 20 12 16 6 20l1.2-8.8L2 8h6z" fill="#a16207" />
              </svg>
            </div>
          )}
        </div>
        
        {short && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{short}</p>
        )}
      </div>
      
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 mt-auto">
        <Link href={`/dashboard/notes/view/${id}`} className={`w-full block text-center bg-gradient-to-br from-purple-600 to-pink-500 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 hover:opacity-90`}>
          Open Note
        </Link>
      </div>
    </article>
  );
}
