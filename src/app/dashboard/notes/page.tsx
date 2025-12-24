
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  Award,
  Search, 
  GraduationCap, 
  Calendar,
  Layers,
  BookMarked,
  Loader2
} from 'lucide-react';
import { fetchAllNotes, type Note } from '@/services/notes';

// Main Page Component
export default function NotesLibraryPage() {
  const [initialNotes, setInitialNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllNotes()
      .then(notes => {
        setInitialNotes(notes);
      })
      .catch(err => {
        console.error("Failed to fetch notes:", err);
        // Optionally set an error state to show in the UI
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return <NotesPageClient initialNotes={initialNotes} />;
}


/**
 * CLIENT COMPONENT
 * Handles interactivity, searching, and filtering.
 */
function NotesPageClient({ initialNotes }: { initialNotes: Note[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCourse, setActiveCourse] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // Advanced Categorization Logic
  const categorizedData = useMemo(() => {
    const tree: Record<string, Record<string, Record<string, Note[]>>> = {};
    
    initialNotes.filter(item => 
      (item.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (item.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    ).forEach(item => {
      const course = item.course || "Other Courses";
      const year = item.year || "General Year";
      const subject = item.subject?.toUpperCase() || "UNCATEGORIZED";

      if (!tree[course]) tree[course] = {};
      if (!tree[course][year]) tree[course][year] = {};
      if (!tree[course][year][subject]) tree[course][year][subject] = [];
      
      tree[course][year][subject].push(item);
    });
    return tree;
  }, [searchQuery, initialNotes]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <BookMarked className="text-white" size={18} />
              </div>
              <span>Notes Library</span>
            </h1>
            <button className="text-[10px] font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
              PREMIUM ACCESS
            </button>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search notes, subjects, or keywords..."
              className="w-full bg-slate-100 border-none rounded-xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-3">
        {Object.keys(categorizedData).length > 0 ? (
          Object.entries(categorizedData).map(([course, years]) => (
            <div key={course} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => {
                  setActiveCourse(activeCourse === course ? null : course);
                  setActiveYear(null);
                  setActiveSubject(null);
                }}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${activeCourse === course ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${activeCourse === course ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{course}</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{Object.keys(years).length} Academic Years</p>
                  </div>
                </div>
                <ChevronDown size={18} className={`transition-transform duration-300 text-slate-400 ${activeCourse === course ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              {activeCourse === course && (
                <div className="border-t border-slate-100 bg-slate-50/30 p-2 space-y-2">
                  {Object.entries(years).map(([year, subjects]) => (
                    <div key={year} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <button 
                        onClick={() => {
                          setActiveYear(activeYear === year ? null : year);
                          setActiveSubject(null);
                        }}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className={activeYear === year ? 'text-indigo-600' : 'text-slate-400'} />
                          <span className="text-sm font-bold text-slate-700">{year}</span>
                        </div>
                        <ChevronDown size={16} className={`transition-transform duration-300 text-slate-300 ${activeYear === year ? 'rotate-180 text-indigo-600' : ''}`} />
                      </button>

                      {activeYear === year && (
                        <div className="p-2 space-y-1 bg-slate-50/50">
                          {Object.entries(subjects).map(([subject, notes]) => (
                            <div key={subject} className="rounded-lg overflow-hidden border border-slate-100 bg-white">
                              <button 
                                onClick={() => setActiveSubject(activeSubject === subject ? null : subject)}
                                className="w-full flex items-center justify-between p-3 text-left hover:bg-indigo-50/30 transition-colors group"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <Layers size={14} className="text-slate-300 group-hover:text-indigo-400" />
                                  <span className="text-xs font-bold text-slate-600 truncate">{subject}</span>
                                </div>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">{notes.length}</span>
                              </button>

                              {activeSubject === subject && (
                                <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white border-t border-slate-50">
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
          ))
        ) : (
          <div className="py-20 text-center opacity-50">
            <Search size={40} className="mx-auto mb-3" />
            <p className="text-sm font-medium">No documents found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note }: { note: Note }) {
  return (
    <a href={`/dashboard/notes/view/${note.id}`} className="group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer">
      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${note.isPremium ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}>
        {note.isPremium ? <Award size={20} /> : <BookOpen size={20} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {note.title}
          </h4>
          {note.isPremium && (
            <span className="shrink-0 text-[8px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase">PRO</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-medium">Verified Note</span>
          <span className="w-1 h-1 rounded-full bg-slate-200" />
          <span className="text-[10px] text-indigo-500 font-bold uppercase">Study Now</span>
        </div>
      </div>

      <div className="shrink-0 p-1.5 bg-slate-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
        <ChevronRight size={14} />
      </div>
    </a>
  );
}
