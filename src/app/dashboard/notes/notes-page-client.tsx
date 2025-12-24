// src/app/dashboard/notes/notes-page-client.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Star, 
  ChevronRight, 
  Filter, 
  GraduationCap, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  BookMarked,
  LayoutGrid
} from 'lucide-react';

export default function NotesPageClient({ initialNotes = [] }: { initialNotes: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourse, setActiveCourse] = useState('All');

  const processedNotes = useMemo(() => {
    return initialNotes.map(note => {
      const subject = note.subject?.toUpperCase() || 'GENERAL';
      let color = 'bg-gray-500'; // Default color
      if (subject.includes('PHARMACOLOGY')) color = 'bg-red-500';
      else if (subject.includes('POC') || subject.includes('CHEMISTRY')) color = 'bg-orange-500';
      else if (subject.includes('ANATOMY') || subject.includes('HAP')) color = 'bg-sky-500';
      else if (subject.includes('PHARMACEUTICS')) color = 'bg-pink-500';
      else if (subject.includes('COMMUNITY')) color = 'bg-emerald-500';
      else if (subject.includes('JURISPRUDENCE') || subject.includes('LAW')) color = 'bg-violet-500';
      else if (subject.includes('PHARMACOGNOSY')) color = 'bg-amber-500';
      else if (subject.includes('EXIT')) color = 'bg-rose-500';
      else color = 'bg-indigo-500';
      
      return {
        ...note,
        color
      };
    });
  }, [initialNotes]);

  const filteredNotes = useMemo(() => {
    return processedNotes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCourse = activeCourse === 'All' || note.course === activeCourse;
      return matchesSearch && matchesCourse;
    });
  }, [searchQuery, activeCourse, processedNotes]);

  const courses = ['All', ...Array.from(new Set(processedNotes.map(n => n.course)))];

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1A1C1E] font-sans pb-20">
      {/* Header & Search */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 pt-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <BookMarked size={20} className="fill-indigo-100" />
                <span className="text-xs font-black uppercase tracking-widest">Digital Archive</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">Learning <span className="text-indigo-600">Hub</span></h1>
            </div>

            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..."
                className="w-full bg-gray-100 border-transparent rounded-2xl py-3.5 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500">
              <Filter size={14} />
              <span className="text-[10px] font-bold uppercase">Filter By</span>
            </div>
            {courses.map(c => (
              <button
                key={c}
                onClick={() => setActiveCourse(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCourse === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-gray-400" />
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Available Resources ({filteredNotes.length})</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 cursor-pointer hover:underline">
            View All Categories <ArrowRight size={14} />
          </div>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-bold">No results found for your filters.</p>
            <button 
              onClick={() => {setActiveCourse('All'); setSearchQuery('');}}
              className="mt-4 text-indigo-600 text-sm font-bold underline"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* Mobile Tab Bar (Floating) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full px-6 py-3 flex items-center gap-8 z-50 md:hidden">
        <div className="flex flex-col items-center gap-1 text-indigo-600">
          <LayoutGrid size={20} />
          <span className="text-[10px] font-bold">Explore</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <Sparkles size={20} />
          <span className="text-[10px] font-bold">Premium</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <Layers size={20} />
          <span className="text-[10px] font-bold">Library</span>
        </div>
      </nav>
    </div>
  );
}

function NoteCard({ note }: { note: any }) {
  return (
    <a href={`/dashboard/notes/view/${note.id}`} className="group relative bg-white rounded-[1.75rem] border border-gray-100 p-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Visual Header */}
      <div className={`relative h-32 w-full rounded-[1.4rem] ${note.color} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-wider border border-white/20">
          {note.subject}
        </div>
        {note.isPremium && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <Star className="text-white fill-white" size={14} />
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
             <GraduationCap size={12} className="text-indigo-600" />
             <span className="text-[10px] font-bold text-gray-700">{note.course}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-extrabold text-gray-900 leading-snug mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.5rem]">
          {note.title}
        </h3>

        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between py-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{note.year}</span>
            </div>
            <div className="text-[10px] font-black text-indigo-600 flex items-center gap-1">
              OPEN <ChevronRight size={14} />
            </div>
          </div>

          <div className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-black py-3.5 px-6 rounded-2xl transition-all duration-300 hover:bg-indigo-600 active:scale-95 shadow-lg shadow-gray-200">
            Study Material
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  );
}