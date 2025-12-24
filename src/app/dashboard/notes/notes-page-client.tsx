
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Star, 
  ChevronDown, 
  Filter, 
  GraduationCap, 
  Calendar,
  Layers,
  ArrowRight,
  BookMarked,
  LayoutGrid,
  Info,
  Sparkles,
  Award
} from 'lucide-react';
import { fetchAllNotes, type Note } from '@/services/notes';
import Link from 'next/link';

function NoteCard({ note }: { note: Note }) {
  return (
    <Link href={`/dashboard/notes/view/${note.id}`} className="group block h-full">
      <div className="bg-white rounded-lg border border-slate-200 p-4 transition-all hover:border-indigo-300 hover:shadow-lg flex flex-col h-full relative cursor-pointer h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-9 h-9 rounded flex items-center justify-center text-white shadow-sm ${note.color}`}>
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
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 group-hover:gap-2 transition-all">
            Study <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}


export default function NotesPageClient({ initialNotes }: { initialNotes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCourse, setOpenCourse] = useState('B.Pharm');
  const [openYear, setOpenYear] = useState(null);

  const yearOrder: { [key: string]: number } = {
    "1st Year": 1,
    "2nd Year": 2,
    "3rd Year": 3,
    "4th Year": 4,
    "2024 Edition": 5,
    "General": 6
  };

  const organizedData = useMemo(() => {
    const tree: { [key: string]: { [key: string]: { [key: string]: Note[] } } } = {};
    const filtered = initialNotes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

  const getCourseTheme = (course: string) => {
    if (course.includes('B.Pharm')) return 'border-indigo-600 text-indigo-700 bg-indigo-50/50';
    if (course.includes('D.Pharm')) return 'border-emerald-600 text-emerald-700 bg-emerald-50/50';
    return 'border-slate-600 text-slate-700 bg-slate-50/50';
  };

  const toggleCourse = (course: string) => setOpenCourse(openCourse === course ? null : course);
  const toggleYear = (year: string) => setOpenYear(openYear === year ? null : year);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1e293b] pb-24 font-sans antialiased">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
                <BookMarked size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Academic <span className="text-indigo-600">Vault</span></h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Student</span>
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200 flex items-center gap-1 shadow-sm">
                <Award size={12} /> GOLD
              </div>
            </div>
          </div>

          <div className="relative">
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

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/50 border border-white rounded-full w-fit mx-auto text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-sm">
          <Sparkles size={12} className="text-amber-500" />
          GPAT-Focused Content Updated for 2025
        </div>

        {Object.entries(organizedData).sort().map(([courseName, years]) => (
          <div key={courseName} className="relative group">
            <div className={`rounded-[2rem] border-2 bg-white shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-300 ${openCourse === courseName ? 'border-transparent' : 'border-white'}`}>
              <button 
                onClick={() => toggleCourse(courseName)}
                className={`w-full flex items-center justify-between p-6 text-left transition-all border-l-4 ${getCourseTheme(courseName)}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl shadow-inner ${openCourse === courseName ? 'bg-white text-indigo-600' : 'bg-white/50 text-slate-500'}`}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 text-base">{courseName}</h2>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Academic Archive • {Object.keys(years).length} Levels
                    </p>
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
                <div className="p-4 space-y-3 bg-white border-t border-slate-100">
                  {Object.entries(years)
                    .sort((a: [string, any], b: [string, any]) => (yearOrder[a[0]] || 99) - (yearOrder[b[0]] || 99))
                    .map(([yearName, subjects]) => (
                      <div key={yearName} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-md">
                        <button 
                          onClick={() => toggleYear(yearName)}
                          className={`w-full flex items-center justify-between p-4 text-left transition-all ${openYear === yearName ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
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
                             {Object.entries(subjects).map(([subjectName, notes]: [string, any[]]) => (
                               <div key={subjectName} className="mb-6 last:mb-0">
                                  <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-0.5 h-3 bg-indigo-600 rounded-full" />
                                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{subjectName}</h3>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        ))}
      </main>
    </div>
  );
}
