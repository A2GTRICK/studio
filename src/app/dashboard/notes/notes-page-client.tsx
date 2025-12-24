
'use client';

import React, { useState, useMemo } from 'react';
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
  ChevronRight
} from 'lucide-react';
import type { Note } from '@/services/notes';

// NoteCard component from your design
function NoteCard({ note }: { note: Note }) {
  return (
    <div className="group relative bg-white rounded-[1.75rem] border border-gray-100 p-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Visual Header */}
      <div className={`relative h-32 w-full rounded-[1.4rem] ${note.color || 'bg-indigo-600'} overflow-hidden`}>
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

          <button className="w-full bg-gray-900 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 group/btn active:scale-95 shadow-lg shadow-gray-200">
            Study Material
            <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}


// The main interactive client component
export default function NotesPageClient({ initialNotes }: { initialNotes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCourse, setOpenCourse] = useState('B.Pharm');
  const [openYear, setOpenYear] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);

  const yearOrder = {
    "1st Year": 1,
    "2nd Year": 2,
    "3rd Year": 3,
    "4th Year": 4,
    "2024 Edition": 5,
    "General": 6,
    "1st year": 1 // Handle variations
  };

  const organizedData = useMemo(() => {
    const tree: { [course: string]: { [year: string]: { [subject: string]: Note[] } } } = {};
    const filtered = initialNotes.filter(n => 
      (n.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (n.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    filtered.forEach(note => {
      const course = note.course || "Other";
      const year = note.year || "General";
      const subject = note.subject?.toUpperCase() || "UNCATEGORIZED";

      if (!tree[course]) tree[course] = {};
      if (!tree[course][year]) tree[course][year] = {};
      if (!tree[course][year][subject]) tree[course][year][subject] = [];
      
      tree[course][year][subject].push(note);
    });

    return tree;
  }, [searchQuery, initialNotes]);

  const toggleCourse = (course: string) => setOpenCourse(openCourse === course ? null : course);
  const toggleYear = (year: string | null) => setOpenYear(openYear === year ? null : year);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1e293b] pb-24 font-sans selection:bg-indigo-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5">
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

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-4">
        {Object.entries(organizedData).sort().map(([courseName, years]) => (
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
                  .sort((a, b) => (yearOrder[a[0] as keyof typeof yearOrder] || 99) - (yearOrder[b[0] as keyof typeof yearOrder] || 99))
                  .map(([yearName, subjects]) => (
                    <div key={yearName} className="bg-white rounded border border-slate-200 overflow-hidden transition-shadow hover:shadow-md">
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
                           {Object.entries(subjects).map(([subjectName, notes]) => (
                             <div key={subjectName} className="mb-6 last:mb-0">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                  <div className="w-0.5 h-3 bg-indigo-600 rounded-full" />
                                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">{subjectName}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {(notes as Note[]).map(note => (
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
      </main>
    </div>
  );
}
