
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
  Award,
} from 'lucide-react';
import type { Note } from '@/services/notes';
import Link from 'next/link';

export default function NotesPageClient({ initialNotes }: { initialNotes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [openYear, setOpenYear] = useState<string | null>(null);

  // Requirement 1: UI-Side Academic Year Ordering
  const yearOrder: { [key: string]: number } = {
    "1st Year": 1,
    "2nd Year": 2,
    "3rd Year": 3,
    "4th Year": 4,
    "5th Year": 5,
    "2024 Edition": 6,
    "General": 7,
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

  useEffect(() => {
    if (Object.keys(organizedData).length > 0 && !openCourse) {
      setOpenCourse(Object.keys(organizedData)[0]);
    }
  }, [organizedData, openCourse]);

  const toggleCourse = (course: string) => setOpenCourse(openCourse === course ? null : course);
  const toggleYear = (year: string) => setOpenYear(openYear === year ? null : year);

  const getCourseTheme = (course: string) => {
    if (course.includes('B.Pharm')) return 'border-indigo-600 text-indigo-700 bg-indigo-50/50';
    if (course.includes('D.Pharm')) return 'border-emerald-600 text-emerald-700 bg-emerald-50/50';
    return 'border-slate-600 text-slate-700 bg-slate-50/50';
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

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1e293b] pb-24 font-sans antialiased">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 md:top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
                <BookMarked size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Academic <span className="text-indigo-600">Vault</span></h1>
            </div>
            <div className="flex items-center gap-2 self-end md:self-center">
              <span className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Student</span>
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200 flex items-center gap-1 shadow-sm">
                <Award size={12} /> GOLD
              </div>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by subject, topic, year or exam..."
              className="w-full bg-slate-100 border border-transparent rounded-2xl py-3 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none font-semibold text-sm transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/50 border border-white rounded-full w-fit mx-auto text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-sm">
          <Info size={12} className="text-indigo-500" />
          GPAT-Focused Content Updated for 2025
        </div>

        {Object.keys(organizedData).length === 0 ? (
           <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
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
          <div key={courseName} className="relative group">
            <div className={`rounded-[2rem] border-2 bg-white shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300 ${openCourse === courseName ? 'border-transparent' : 'border-white'}`}>
              <button 
                onClick={() => toggleCourse(courseName)}
                className={`w-full flex items-center justify-between p-6 text-left transition-all border-l-[6px] ${getCourseTheme(courseName)}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl shadow-inner ${openCourse === courseName ? 'bg-white text-indigo-600' : 'bg-white/50 text-slate-500'}`}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-lg leading-tight">{courseName}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Academic Master Catalog</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400">STATUS</span>
                    <span className="text-[10px] font-black text-indigo-600">VERIFIED</span>
                  </div>
                  <ChevronDown size={24} className={`transition-transform duration-500 ${openCourse === courseName ? 'rotate-180 text-indigo-600' : 'text-slate-300'}`} />
                </div>
              </button>

              {openCourse === courseName && (
                <div className="p-4 space-y-4 bg-[#F8FAFC]">
                  {Object.entries(years)
                    .sort((a, b) => (yearOrder[a[0]] || 99) - (yearOrder[b[0]] || 99))
                    .map(([yearName, subjects]) => (
                      <div key={yearName} className={`rounded-3xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow border-l-4 ${yearColors[yearName] || 'border-slate-400'}`}>
                        <button 
                          onClick={() => toggleYear(yearName)}
                          className={`w-full flex items-center justify-between p-4 text-left transition-all ${
                            openYear === yearName ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${openYear === yearName ? 'bg-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                              <Calendar size={18} />
                            </div>
                            <div>
                              <span className="font-black text-sm block leading-none mb-1">{yearName}</span>
                              <div className={`text-[10px] font-black flex items-center gap-2 tracking-tight ${openYear === yearName ? 'text-indigo-200' : 'text-slate-400'}`}>
                                <span className="uppercase">{Object.keys(subjects).length} CORE SUBJECTS</span>
                                <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                <span className="uppercase tracking-tighter">EXAM FOCUSED</span>
                              </div>
                            </div>
                          </div>
                          <ChevronDown size={20} className={`transition-transform duration-300 ${openYear === yearName ? 'rotate-180 text-white' : 'text-slate-300'}`} />
                        </button>

                        {openYear === yearName && (
                          <div className="p-4 bg-[#F1F5F9]">
                             {Object.entries(subjects).map(([subjectName, notes]: [string, Note[]]) => (
                               <div key={subjectName} className="mb-8 last:mb-0">
                                  <div className="flex items-center gap-3 mb-4 p-3 bg-white border border-slate-200 rounded-xl">
                                    <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{subjectName}</h3>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {notes.map(note => (
                                      <NoteCard key={note.id} note={note} />
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
          </div>
        )))}
      </main>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <Link href={`/dashboard/notes/view/${note.id}`} className="group block h-full">
      <div className="bg-white rounded-[1.5rem] border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative overflow-hidden active:scale-[0.97]">
        <div className={`absolute top-0 right-0 w-12 h-12 ${note.color} opacity-5 rounded-bl-[3rem] transition-all group-hover:scale-150 -z-0`} />
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className={`w-12 h-12 rounded-2xl ${note.color} flex items-center justify-center text-white shadow-lg shadow-current/20`}>
            <BookOpen size={24} />
          </div>
          {note.isPremium && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100 shadow-sm">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-tight">PREMIUM</span>
            </div>
          )}
        </div>

        <div className="flex-1 relative z-10">
          <div className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.15em] mb-2">{note.subject}</div>
          <h4 className="text-[15px] font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 mb-4">
            {note.title}
          </h4>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Layers size={12} className="text-slate-400" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase">Archive No. {note.id}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-black text-indigo-600 group-hover:gap-2 transition-all">
            STUDY NOW <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
}

    