
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookCopy, 
  Star, 
  Search, 
  Filter, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  ChevronRight, 
  ChevronDown,
  LayoutGrid,
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

export default function NotesLibraryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const fetchedNotes = await fetchAllNotes();
        setNotes(fetchedNotes);
        // By default, have all sections open initially
        const initialOpenState = fetchedNotes.reduce((acc, note) => {
          const subject = (note.subject || 'General').toUpperCase();
          acc[subject] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setOpenSections(initialOpenState);
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Normalize subject names for cleaner categorization
  const processedNotes = useMemo(() => {
    return notes.map(note => ({
      ...note,
      displaySubject: (note.subject || 'General').toUpperCase()
    }));
  }, [notes]);

  const subjects = useMemo(() => {
    const s = new Set(processedNotes.map(n => n.displaySubject));
    return ['All', ...Array.from(s).sort()];
  }, [processedNotes]);

  const filteredNotes = useMemo(() => {
    return processedNotes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.displaySubject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || note.displaySubject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, selectedSubject, processedNotes]);

  const groupedNotes = useMemo(() => {
    return filteredNotes.reduce((acc, note) => {
      if (!acc[note.displaySubject]) acc[note.displaySubject] = [];
      acc[note.displaySubject].push(note);
      return acc;
    }, {} as Record<string, Note[]>);
  }, [filteredNotes]);

  const toggleSection = (subject: string) => {
    setOpenSections(prev => ({
      ...prev,
      [subject]: !prev[subject]
    }));
  };

  return (
    <div className={`${THEME.pageBg} min-h-screen font-sans text-slate-900`}>
      {/* Navbar Area */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Library className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">NotesLibrary</span>
          </div>

          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search across all pharmacy subjects..."
              className="w-full bg-slate-100 border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">Dashboard</a>
            <a href="/dashboard/billing" className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-600 transition-colors">Go Premium</a>
          </div>
        </div>
      </header>

      {/* Hero Header */}
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

          {/* Categorization Pills */}
          <div className="flex items-center gap-3 mt-10 overflow-x-auto pb-4 scrollbar-hide">
            <Filter size={16} className="text-slate-400 shrink-0" />
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedSubject === sub 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600"/>
          </div>
        ) : Object.keys(groupedNotes).length === 0 ? (
          <div className="py-20 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No resources found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNotes).map(([subject, notesList]) => (
              <Section 
                key={subject} 
                subject={subject} 
                notes={notesList as Note[]} 
                isOpen={openSections[subject] ?? false} 
                onToggle={() => toggleSection(subject)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      <button className="fixed bottom-6 right-6 md:hidden bg-indigo-600 text-white p-4 rounded-full shadow-2xl z-50">
        <LayoutGrid size={24} />
      </button>
    </div>
  );
}

function Section({ subject, notes, isOpen, onToggle }: { subject: string, notes: Note[], isOpen: boolean, onToggle: () => void }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
      <button 
        onClick={onToggle}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookCopy size={24} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{subject}</h2>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{notes.length} Documents Available</p>
          </div>
        </div>
        <div className={`p-2 rounded-full transition-all ${isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      
      {isOpen && (
        <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {notes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
            <span className="text-xs font-bold">{note.course}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={14} />
            <span className="text-xs font-medium">{note.year}</span>
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
