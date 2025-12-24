'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Star,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  BookMarked,
  Info,
  Sparkles,
  Award,
} from 'lucide-react';
import type { Note } from '@/services/notes';
import Link from 'next/link';

export default function NotesPageClient({ initialNotes }: { initialNotes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [openYear, setOpenYear] = useState<string | null>(null);

  // Set the default open course when notes are loaded
  useEffect(() => {
    if (initialNotes.length > 0 && !openCourse) {
      const firstCourse = Object.keys(organizedData)[0];
      if (firstCourse) setOpenCourse(firstCourse);
    }
  }, [initialNotes, openCourse]);

  const yearOrder: { [key: string]: number } = {
    "1st Year": 1,
    "2nd Year": 2,
    "3rd Year": 3,
    "4th Year": 4,
    "2024 Edition": 5,
    "General": 6,
  };
  
  const yearColors: { [key: string]: string } = {
    "1st Year": "border-blue-500",
    "2nd Year": "border-emerald-500",
    "3rd Year": "border-amber-500",
    "4th Year": "border-rose-500",
    "5th Year": "border-gray-500",
    "2024 Edition": "border-cyan-500",
    "General": "border-slate-400",
  };


  const organizedData = useMemo(() => {
    const tree: { [key: string]: { [key: string]: { [key: string]: Note[] } } } = {};
    const filtered = initialNotes.filter(n => 
      (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.subject && n.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.forEach(note => {
      const course = note.course || 'Other';
      const year = note.year || 'General';
      const subject = note.subject || 'Uncategorized';
      
      if (!tree[course]) tree[course] = {};
      if (!tree[course][year]) tree[course][year] = {};
      if (!tree[course][year][subject]) tree[course][year][subject] = [];
      
      tree[course][year][subject].push(note);
    });

    return tree;
  }, [searchQuery, initialNotes]);

  const toggleCourse = (course: string) => setOpenCourse(openCourse === course ? null : course);
  const toggleYear = (year: string) => setOpenYear(openYear === year ? null : year);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1e293b] pb-24 font-sans selection:bg-indigo-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-16 md:top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <BookMarked size={24} className="text-indigo-600" />
                Library
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <Info size={12} className="text-indigo-400" />
                <span>GPAT-Focused Content Available for 2025</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <Star size={12} className="text-amber-500 fill-amber-500" /> Premium Active
              </div>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by subject, topic, year, or exam..."
              className="w-full bg-slate-100 border border-transparent rounded-lg py-3 pl-12 pr-4 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-sm transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-4">
        {Object.keys(organizedData).length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-bold">No documents found for your search.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-indigo-600 text-sm font-bold underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          Object.entries(organizedData).sort().map(([courseName, years]) => (
            <div key={courseName} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleCourse(courseName)}
                className={`w-full flex items-center justify-between p-5 text-left transition-all relative border-l-4 ${
                  openCourse === courseName 
                  ? 'bg-indigo-50/50 border-indigo-600' 
                  : 'hover:bg-slate-50 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded ${openCourse === courseName ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 text-base">{courseName}</h2>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Academic Archive • {Object.keys(years).length} Levels
                    </p>
                  </div>
                </div>
                <ChevronDown size={20} className={`transition-transform duration-300 ${openCourse === courseName ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`} />
              </button>

              {openCourse === courseName && (
                <div className="p-4 space-y-3 bg-white border-t border-slate-100">
                  {Object.entries(years)
                    .sort((a, b) => (yearOrder[a[0]] || 99) - (yearOrder[b[0]] || 99))
                    .map(([yearName, subjects]) => (
                      <div key={yearName} className={`rounded-xl border bg-white overflow-hidden transition-shadow hover:shadow-md border-l-4 ${yearColors[yearName] || 'border-slate-400'}`}>
                        <button 
                          onClick={() => toggleYear(yearName)}
                          className={`w-full flex items-center justify-between p-4 text-left transition-all ${openYear === yearName ? 'bg-slate-800 text-white' : 'hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-4">
                            <Calendar size={18} className={openYear === yearName ? 'text-indigo-400' : 'text-slate-400'} />
                            <div>
                              <span className="font-bold text-sm block leading-none mb-1">{yearName}</span>
                              <div className={`text-[10px] font-medium uppercase tracking-tight flex items-center gap-1.5 ${openYear === yearName ? 'text-indigo-200' : 'text-slate-500'}`}>
                                <span>{Object.keys(subjects).length} Subjects</span>
                                <span className="opacity-40">•</span>
                                <span>{yearName.includes('Year') ? 'Core Academic Foundations' : 'Exam-Focused Notes'}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown size={18} className={`transition-transform duration-300 ${openYear === yearName ? 'rotate-180 text-white' : 'text-slate-300'}`} />
                        </button>
                        
                        {openYear === yearName && (
                          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                             {Object.entries(subjects).map(([subjectName, notes]: [string, Note[]]) => (
                               <div key={subjectName} className="mb-6 last:mb-0">
                                  <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-0.5 h-3 bg-indigo-600 rounded-full" />
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{subjectName}</h3>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {notes.map(note => (
                                      <Link key={note.id} href={`/dashboard/notes/view/${note.id}`} className="group block h-full">
                                        <NoteCard note={note} />
                                      </Link>
                                    ))}
                                  </div>
                               </div>
                             ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <div className="group bg-white rounded-lg border border-slate-200 p-4 transition-all hover:border-indigo-300 hover:shadow-lg flex flex-col h-full relative cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-9 h-9 rounded flex items-center justify-center text-white shadow-sm ${note.color || 'bg-gray-400'}`}>
          <BookOpen size={18} />
        </div>
        {note.isPremium && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100">
            <Star size={10} className="fill-amber-500 text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-tight">Pro</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2 mb-4">
          {note.title}
        </h4>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          <Layers size={12} />
          Verified Source
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
          Study <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
}