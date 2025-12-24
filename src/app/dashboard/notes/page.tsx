
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookCopy, 
  Star, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  ChevronRight, 
  ChevronDown,
  Library,
  BookMarked,
  Loader2
} from 'lucide-react';
import { fetchAllNotes, type Note } from '@/services/notes';

const THEME = {
  pageBg: 'bg-slate-50',
  card: 'bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300',
  accent: 'indigo'
};

// Re-usable Note Card Component
function NoteCard({ note }: { note: Note }) {
  return (
    <a href={`/dashboard/notes/view/${note.id}`} className="group flex flex-col h-full bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all duration-500 overflow-hidden">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-2xl bg-white shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
            <BookOpen size={20} />
          </div>
          {note.isPremium && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-200">
              <Star size={12} className="text-amber-600 fill-amber-600" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">Premium</span>
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-800 leading-snug mb-6 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
          {note.title}
        </h3>

        <div className="space-y-3 pt-4 border-t border-slate-200/50">
          <div className="flex items-center gap-2 text-slate-500">
            <GraduationCap size={14} />
            {/* COMBINED COURSE AND YEAR ON ONE LINE */}
            <span className="text-xs font-bold">{note.course || 'General'} • {note.year || 'All Years'}</span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0 mt-auto">
        <div className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold group-hover:bg-indigo-600 transition-all shadow-lg group-hover:shadow-indigo-200">
          Study Now
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </a>
  );
}

// Client Component for interactivity
function NotesPageClient({ initialNotes }: { initialNotes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const processedNotes = useMemo(() => {
    return initialNotes.map(note => ({
      ...note,
      displayCourse: (note.course || "General").trim(),
      displaySubject: (note.subject || "Uncategorized").toUpperCase().trim(),
    }));
  }, [initialNotes]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return processedNotes;
    const lowercasedQuery = searchQuery.toLowerCase();
    return processedNotes.filter(note =>
      note.title.toLowerCase().includes(lowercasedQuery) ||
      note.displaySubject.toLowerCase().includes(lowercasedQuery) ||
      note.displayCourse.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, processedNotes]);

  const groupedNotes = useMemo(() => {
    return filteredNotes.reduce((acc, note) => {
      const course = note.displayCourse;
      const subject = note.displaySubject;
      if (!acc[course]) acc[course] = {};
      if (!acc[course][subject]) acc[course][subject] = [];
      acc[course][subject].push(note);
      return acc;
    }, {} as Record<string, Record<string, Note[]>>);
  }, [filteredNotes]);

  const orderedCourses = Object.keys(groupedNotes).sort((a,b) => a.localeCompare(b));

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Library className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">Notes Library</span>
          </div>
          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search notes by title, subject, or course..."
              className="w-full bg-slate-100 border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest mb-4 border border-indigo-100">
            <BookMarked size={12} />
            Verified Study Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Learning <span className="text-indigo-600">Hub</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Access organized, top-tier pharmacy notes and predicted questions for your academic success.
          </p>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        {orderedCourses.length === 0 ? (
          <div className="py-20 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No resources found</h3>
            <p className="text-slate-500">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {orderedCourses.map(course => (
              <div key={course}>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{course}</h2>
                <div className="space-y-4">
                  {Object.entries(groupedNotes[course]).map(([subject, notesList]) => (
                     <div key={subject} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                        <button 
                          onClick={() => toggleSection(`${course}-${subject}`)}
                          className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors group text-left"
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <BookCopy size={24} />
                            </div>
                            <div>
                               <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{subject}</h3>
                               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{notesList.length} Documents</p>
                            </div>
                          </div>
                          <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${openSections[`${course}-${subject}`] ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {openSections[`${course}-${subject}`] && (
                           <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t">
                              {notesList.map(note => (
                                <NoteCard key={note.id} note={note} />
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Server Component Wrapper
async function NotesData() {
  const notes = await fetchAllNotes();
  return <NotesPageClient initialNotes={notes} />;
}

export default function NotesLibraryPage() {
  return (
    <React.Suspense fallback={
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    }>
        <NotesData />
    </React.Suspense>
  );
}
