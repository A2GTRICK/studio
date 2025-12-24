
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

  const yearOrder: Record<string, number> = {
    '1st Year': 1,
    '2nd Year': 2,
    '3rd Year': 3,
    '4th Year': 4,
    '5th Year': 5,
    '2024 Edition': 6,
    General: 7,
  };

  const organizedData = useMemo(() => {
    const tree: Record<string, Record<string, Record<string, Note[]>>> = {};
    const filtered = initialNotes.filter(
      n =>
        n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subject?.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-16 md:top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
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
        {/* Intelligence Cue */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-white/50 border border-white rounded-full w-fit mx-auto text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] shadow-sm">
           <Info size={12} className="text-indigo-500" />
           Verified Academic Resources
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
                                    <div
                                        className="grid gap-4"
                                        style={{
                                        gridTemplateColumns:
                                            'repeat(auto-fit, minmax(260px, 1fr))',
                                        }}
                                    >
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
  const progressKey = `note-progress-${note.id}`;

  const [progress, setProgress] = React.useState<
    'new' | 'in-progress' | 'completed'
  >('new');

  // Load progress
  React.useEffect(() => {
    const saved = localStorage.getItem(progressKey) as
      | 'new'
      | 'in-progress'
      | 'completed'
      | null;
    if (saved) setProgress(saved);
  }, [progressKey]);

  // Mark as in-progress on click
  const handleClick = () => {
    if (progress === 'new') {
      localStorage.setItem(progressKey, 'in-progress');
      setProgress('in-progress');
    }
  };

  return (
    <Link
      href={`/dashboard/notes/view/${note.id}`}
      onClick={handleClick}
      className="group block h-full"
    >
      <div className="relative flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

        {/* HEADER */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
            <BookOpen size={22} />
          </div>

          {/* PREMIUM BADGE + TOOLTIP */}
          {note.isPremium && (
            <div className="relative flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-600 text-[10px] font-black">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              PREMIUM
              <span className="group/info relative ml-1 cursor-pointer text-amber-500">
                ⓘ
                <span className="pointer-events-none absolute right-0 top-6 z-20 w-56 rounded-xl border border-slate-200 bg-white p-3 text-[11px] font-semibold text-slate-600 opacity-0 shadow-lg transition group-hover/info:opacity-100">
                  Includes exam-focused notes, PYQs, expert explanations
                </span>
              </span>
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex-1">
          <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-indigo-600">
            {note.subject}
          </div>

          <h4 className="mb-4 line-clamp-2 text-[15px] font-black text-slate-800 group-hover:text-indigo-600">
            {note.title}
          </h4>
        </div>

        {/* FOOTER */}
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">

          {/* PROGRESS INDICATOR */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase">
            {progress === 'new' && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">
                ● New
              </span>
            )}
            {progress === 'in-progress' && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-600">
                ● In Progress
              </span>
            )}
            {progress === 'completed' && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-600">
                ● Completed
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black text-indigo-600">
            STUDY NOW <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </Link>
  );
}
