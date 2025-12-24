"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  ChevronDown, 
  GraduationCap, 
  Calendar,
  Layers,
  ArrowRight,
  Award
} from 'lucide-react';

function NoteCard({ note }: { note: any }) {
  return (
    <a href={`/dashboard/notes/view/${note.id}`} className="group bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col h-full relative overflow-hidden">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${note.color || 'bg-slate-100'} flex items-center justify-center text-white shadow-lg`}>
          <BookOpen size={20} />
        </div>
        {note.isPremium && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">
            <Award size={10} className="fill-amber-600" />
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


export default function NotesPageClient({ initialNotes }: { initialNotes: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourse, setActiveCourse] = useState<string | null>(initialNotes[0]?.course || null);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const organizedData = useMemo(() => {
    const tree: { [course: string]: { [year: string]: { [subject: string]: any[] } } } = {};
    initialNotes.filter(n => 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    ).forEach(note => {
      const course = note.course || "Other";
      const year = note.year || "General";
      const subject = note.subject?.toUpperCase() || 'UNCATEGORIZED';

      if (!tree[course]) tree[course] = {};
      if (!tree[course][year]) tree[course][year] = {};
      if (!tree[course][year][subject]) tree[course][year][subject] = [];
      
      tree[course][year][subject].push(note);
    });
    return tree;
  }, [searchQuery, initialNotes]);

  const toggleCourse = (course: string) => {
      setActiveCourse(prev => (prev === course ? null : course));
      setActiveYear(null);
      setActiveSubject(null);
  };
  const toggleYear = (year: string) => {
      setActiveYear(prev => (prev === year ? null : year));
      setActiveSubject(null);
  };
  const toggleSubject = (subject: string) => {
      setActiveSubject(prev => (prev === subject ? null : subject));
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1e293b] pb-10">
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-3">
        {Object.entries(organizedData).map(([courseName, years]) => (
          <div key={courseName} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <button 
              onClick={() => toggleCourse(courseName)}
              className={`w-full flex items-center justify-between p-5 text-left transition-all ${activeCourse === courseName ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${activeCourse === courseName ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h2 className="font-black text-lg leading-tight">{courseName}</h2>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${activeCourse === courseName ? 'text-white/70' : 'text-slate-400'}`}>
                    {Object.keys(years).length} Academic Sessions
                  </p>
                </div>
              </div>
              <ChevronDown className={`transition-transform duration-300 ${activeCourse === courseName ? 'rotate-180' : 'text-slate-300'}`} />
            </button>

            {activeCourse === courseName && (
              <div className="p-2 space-y-2 bg-slate-50/30">
                {Object.entries(years).map(([yearName, subjects]) => (
                  <div key={yearName} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleYear(yearName)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-all ${activeYear === yearName ? 'bg-slate-800 text-white' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className={activeYear === yearName ? 'text-indigo-400' : 'text-slate-400'} />
                        <span className="font-bold text-sm">{yearName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black opacity-50">{Object.keys(subjects).length} Subjects</span>
                        <ChevronDown size={16} className={`transition-transform ${activeYear === yearName ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {activeYear === yearName && (
                      <div className="p-2 space-y-1">
                        {Object.entries(subjects).map(([subjectName, notes]) => (
                          <div key={subjectName} className="rounded-lg overflow-hidden border border-slate-100 bg-white">
                            <button 
                              onClick={() => toggleSubject(subjectName)}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-indigo-50/30 group"
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Layers size={14} className="text-slate-300 group-hover:text-indigo-400" />
                                <span className="text-xs font-bold text-slate-600 truncate">{subjectName}</span>
                              </div>
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">{notes.length}</span>
                            </button>

                            {activeSubject === subjectName && (
                              <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50/50 border-t border-slate-100">
                                {notes.map(note => (
                                  <NoteCard key={note.id} note={note} />
                                ))}
                              </div>
                            )}
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
