
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { BookCopy, Star, Search, Filter, BookOpen, GraduationCap, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { fetchAllNotes, type Note } from '@/services/notes';

const THEME = {
  pageBg: 'bg-[#F9FAFB]',
  accent: 'text-indigo-600',
  accentBg: 'bg-indigo-600',
  glass: 'backdrop-blur-md bg-white/70 border border-white/20',
};

export default function NotesLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        const fetchedNotes = await fetchAllNotes();
        setNotes(fetchedNotes);
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.course?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, selectedSubject, notes]);

  const subjects = useMemo(() => {
    const s = new Set(notes.map(n => n.subject || 'General'));
    return ['All', ...Array.from(s).sort()];
  }, [notes]);

  const groupedBySubject = useMemo(() => {
    return filteredNotes.reduce((acc, note) => {
      const subject = note.subject || 'General';
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push(note);
      return acc;
    }, {} as Record<string, Note[]>);
  }, [filteredNotes]);

  const orderedSubjects = Object.keys(groupedBySubject).sort((a, b) => {
    if (a === 'General') return 1;
    if (b === 'General') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className={`${THEME.pageBg} min-h-screen pb-20 font-sans`}>
      {/* Header Section with Glassmorphism Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-10 md:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest border border-indigo-100">
                <BookOpen size={12} className="stroke-[3px]" />
                Learning Hub
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                Notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Library</span>
              </h1>
              <p className="text-gray-500 text-lg max-w-lg leading-relaxed">
                Unlock your potential with our collection of verified, top-tier study resources.
              </p>
            </div>
            
            {/* Search Input Group */}
            <div className="relative w-full lg:max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text"
                placeholder="Search by title, course, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-gray-800 shadow-sm"
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-4 mt-10 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex items-center gap-2 text-gray-500 bg-gray-100/50 px-3 py-2 rounded-xl border border-gray-200">
              <Filter size={14} className="text-gray-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Subjects</span>
            </div>
            <div className="flex gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                    selectedSubject === subject 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-10">
        {loading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600"/>
            </div>
        ) : orderedSubjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 text-indigo-200">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No matching notes</h3>
            <p className="text-gray-500 mt-2 max-w-xs">We couldn't find any resources matching your current search or filters.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedSubject('All');}}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {orderedSubjects.map((subject) => (
              <section key={subject} className="space-y-6">
                <div className="flex items-end justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <BookCopy size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">{subject}</h2>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                          {groupedBySubject[subject].length} Available Documents
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {groupedBySubject[subject].map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  const { id, title, course, year, isPremium } = note;

  return (
    <article className="group relative bg-white rounded-[2rem] border border-gray-100 hover:border-indigo-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] flex flex-col overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <ChevronRight size={18} />
        </div>
      </div>
      
      <div className="p-8 flex-grow flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
             <BookOpen size={24} />
          </div>
          {isPremium && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Premium</span>
            </div>
          )}
        </div>

        <h4 className="text-xl font-extrabold text-gray-900 leading-[1.3] mb-6 group-hover:text-indigo-600 transition-colors">
          {title}
        </h4>

        <div className="mt-auto pt-6 border-t border-gray-50 space-y-3">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-indigo-50 transition-colors">
              <GraduationCap size={16} className="text-gray-400 group-hover:text-indigo-400" />
            </div>
            <span className="text-sm font-bold truncate">{course}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <div className="p-1.5 bg-gray-100 rounded-lg">
              <Calendar size={16} />
            </div>
            <span className="text-sm font-semibold">{year || "2024 Edition"}</span>
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-2">
        <a 
          href={`/dashboard/notes/view/${id}`} 
          className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 active:scale-95"
        >
          Study Now
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </article>
  );
}
