
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Star, 
  Search, 
  GraduationCap, 
  Calendar,
  Layers,
  Award,
  BookMarked
} from 'lucide-react';
import { fetchAllNotes, type Note } from '@/services/notes';

function NoteCard({ note }: { note: Note }) {
  return (
    <a href={`/dashboard/notes/view/${note.id}`} className="group bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col h-full relative overflow-hidden">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${note.color || 'bg-indigo-500'} flex items-center justify-center text-white shadow-lg`}>
          <BookOpen size={20} />
        </div>
        {note.isPremium && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">
            <Star size={10} className="fill-amber-600" />
            <span className="text-[8px] font-black uppercase">Premium</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex-1">
        <h4 className="text-sm font-extrabold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 mb-4">
          {note.title}
        </h4>
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Verified Material</span>
        <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 group-hover:gap-2 transition-all">
          STUDY NOW <ArrowRight size={14} />
        </div>
      </div>

      {/* Hover Background Accent */}
      <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-0" />
    </a>
  );
}


export default function NotesPageClient({ initialNotes }: { initialNotes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCourse, setOpenCourse] = useState<string | null>(null);
  const [openYear, setOpenYear] = useState<string | null>(null);

  useEffect(() => {
    // Set the first course as open by default if there are notes
    if (initialNotes.length > 0) {
        const firstCourse = initialNotes[0].course;
        if(firstCourse) {
            setOpenCourse(firstCourse);
        }
    }
  }, [initialNotes]);


  // Grouping logic: Course -> Year -> Subject
  const organizedData = useMemo(() => {
    const tree: { [course: string]: { [year: string]: { [subject: string]: Note[] } } } = {};
    initialNotes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase())).forEach(note => {
      const course = note.course || "Other Courses";
      const year = note.year || "General";
      const subject = note.subject.toUpperCase();

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#1e293b] pb-24">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
              <BookMarked size={22} /> Library
            </h1>
            <div className="flex gap-2">
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200">PRO ACTIVE</div>
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by title or subject..."
              className="w-full bg-slate-100 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Foldable Content */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
        {Object.entries(organizedData).map(([courseName, years]) => (
          <div key={courseName} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Course Level (The Big Fold) */}
            <button 
              onClick={() => toggleCourse(courseName)}
              className={`w-full flex items-center justify-between p-5 text-left transition-all ${openCourse === courseName ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${openCourse === courseName ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2 className="font-black text-lg leading-tight">{courseName}</h2>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${openCourse === courseName ? 'text-white/70' : 'text-slate-400'}`}>
                    {Object.keys(years).length} Academic Sessions
                  </p>
                </div>
              </div>
              <ChevronDown className={`transition-transform duration-300 ${openCourse === courseName ? 'rotate-180' : 'text-slate-300'}`} />
            </button>

            {/* Year Level (Nested Fold) */}
            {openCourse === courseName && (
              <div className="p-4 space-y-3 bg-slate-50/50">
                {Object.entries(years).map(([yearName, subjects]) => (
                  <div key={yearName} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleYear(yearName)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-all ${openYear === yearName ? 'bg-slate-800 text-white' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className={openYear === yearName ? 'text-indigo-400' : 'text-slate-400'} />
                        <span className="font-bold text-sm">{yearName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black opacity-50">{Object.keys(subjects).length} Subjects</span>
                        <ChevronDown size={16} className={`transition-transform ${openYear === yearName ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Note Grid (Visible when Year is open) */}
                    {openYear === yearName && (
                      <div className="p-4 bg-slate-50">
                         {Object.entries(subjects).map(([subjectName, notes]) => (
                           <div key={subjectName} className="mb-6 last:mb-0">
                              <div className="flex items-center gap-2 mb-3 px-1">
                                <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{subjectName}</h3>
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
        ))}

        {Object.keys(organizedData).length === 0 && (
          <div className="py-20 text-center opacity-50">
            <Search size={40} className="mx-auto mb-3" />
            <p className="text-sm font-medium">No documents found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
