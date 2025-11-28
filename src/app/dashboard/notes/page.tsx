"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useNotes } from "@/context/notes-context";
import { useAuth } from "@/hooks/use-auth";

export default function NotesLibraryPage() {
  const { notes, loading, refresh } = useNotes();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  const unique = (key: keyof typeof notes[number]) => {
    const s = new Set(notes.map(n => (n as any)[key] || "").filter(Boolean));
    return ["All", ...Array.from(s)];
  };

  const courses = useMemo(() => unique("course"), [notes]);
  const years = useMemo(() => unique("year"), [notes]);
  const subjects = useMemo(() => unique("subject"), [notes]);

  const filtered = useMemo(() => {
    return notes.filter(n => {
      if (courseFilter !== "All" && n.course !== courseFilter) return false;
      if (yearFilter !== "All" && n.year !== yearFilter) return false;
      if (subjectFilter !== "All" && n.subject !== subjectFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!(n.title.toLowerCase().includes(s) || (n.subject || "").toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [notes, courseFilter, yearFilter, subjectFilter, search]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold">📚 Notes Library</h1>
        <p className="text-gray-600 mt-1">Browse notes. Click a note to view full content.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select value={courseFilter} onChange={(e)=>setCourseFilter(e.target.value)} className="p-2 border rounded">
          {courses.map(c=> <option key={c} value={c}>{c}</option>)}        </select>

        <select value={yearFilter} onChange={(e)=>setYearFilter(e.target.value)} className="p-2 border rounded">
          {years.map(y=> <option key={y} value={y}>{y}</option>)}        </select>

        <select value={subjectFilter} onChange={(e)=>setSubjectFilter(e.target.value)} className="p-2 border rounded">
          {subjects.map(s=> <option key={s} value={s}>{s}</option>)}        </select>

        <div className="flex gap-2">
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search title or subject" className="flex-1 p-2 border rounded" />
          <button onClick={refresh} className="px-4 py-2 bg-blue-600 text-white rounded">Refresh</button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 bg-white border rounded">Loading notes…</div>
      ) : filtered.length === 0 ? (
        <div className="p-6 bg-white border rounded text-center">
          <p className="text-gray-600">No notes found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(note => (
            <article key={note.id} className="bg-white p-4 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-lg font-semibold">{note.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{note.short}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="text-xs text-gray-500">{note.course} • {note.year || "—"}</div>
                <Link href={`/dashboard/notes/view?title=${encodeURIComponent(note.title)}&short=${encodeURIComponent(note.short||"")}&content=${encodeURIComponent(note.content||"")}`} className="text-blue-600 font-semibold text-sm">
                  View →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}