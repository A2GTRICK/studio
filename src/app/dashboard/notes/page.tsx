// src/app/dashboard/notes/page.tsx
"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useNotes } from "@/context/notes-context";
import { useAuth } from "@/hooks/use-auth";
import { ChevronDown } from "lucide-react";

/**
 * Premium Notes Library — Autofit + Group + Tabs
 *
 * - V3 with corrected card spacing.
 * - Tabs: All | B.Pharm | D.Pharm | MCQ | Premium
 * - Groups: styled and collapsible subject groups
 * - Responsive autofit grid for note cards
 *
 * Theme: A2G purple premium (Tailwind classes used)
 */

const THEME = {
  pageBg: "bg-[#F8F5FF]",
  card: "bg-white rounded-2xl shadow-lg border border-[#EDE1FF]",
  accent: "text-[#6B21A8]",
  groupHeaderBg: "bg-[#F9F6FF]", // Subtle bg for group headers
};

type TabKey = "all" | "bpharm" | "dpharm" | "mcq" | "premium";

export default function NotesLibraryPage(): JSX.Element {
  const { notes, loading, refresh } = useNotes();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    const onResize = () => setCompactMode(window.innerWidth < 520);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "bpharm", label: "B.Pharm" },
    { key: "dpharm", label: "D.Pharm" },
    { key: "mcq", label: "MCQ" },
    { key: "premium", label: "Premium" },
  ];

  const normalizedNotes = useMemo(() => {
    return (notes || []).map((n) => ({
      id: n.id,
      title: (n.title || "Untitled").trim(),
      short: n.short || "",
      content: n.content || "",
      course: (n.course || "General").trim(),
      year: (n.year || "").trim(),
      subject: (n.subject || "General").trim(),
      isPremium: !!(n as any).isPremium,
    }));
  }, [notes]);

  const notesInTab = useMemo(() => {
    const tab = activeTab;
    return normalizedNotes.filter((n) => {
      if (tab === "all") return true;
      if (tab === "bpharm") return /b\.?pharm/i.test(n.course);
      if (tab === "dpharm") return /d\.?pharm/i.test(n.course);
      if (tab === "mcq") return /mcq|question/i.test(n.title + " " + n.subject + " " + n.short);
      if (tab === "premium") return !!n.isPremium;
      return true;
    });
  }, [normalizedNotes, activeTab]);

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notesInTab;
    return notesInTab.filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.short.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.course.toLowerCase().includes(q)
      );
    });
  }, [notesInTab, query]);

  const groupedBySubject = useMemo(() => {
    const groups: Record<string, typeof filteredNotes> = {};
    filteredNotes.forEach((n) => {
      const key = n.subject || "General";
      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    const order = Object.keys(groups).sort((a, b) => {
      if (a === "General") return 1;
      if (b === "General") return -1;
      return a.localeCompare(b);
    });
    const ordered: Record<string, typeof filteredNotes> = {};
    order.forEach((k) => (ordered[k] = groups[k]));
    return ordered;
  }, [filteredNotes]);

  const toggleGroup = (subject: string) =>
    setOpenGroups((prev) => ({ ...prev, [subject]: !prev[subject] }));

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(groupedBySubject).forEach((s) => {
      initial[s] = !compactMode;
    });
    setOpenGroups(initial);
  }, [activeTab, compactMode, notes]);

  return (
    <div className={`${THEME.pageBg} min-h-screen p-4 md:p-8`}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-500 text-white text-lg">
                📚
              </span>
              <span>Notes Library</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">Explore and study from the best curated notes.</p>
          </div>
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-[#EFE9FF]">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-2 text-sm rounded-lg transition ${
                    activeTab === t.key ? "bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-md" : "text-gray-700 hover:bg-[#F4F1FF]"
                  }`}>
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        <div className="md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-sm transition ${
                  activeTab === t.key ? "bg-purple-600 text-white" : "bg-white text-gray-700 border"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#EFE9FF]">
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as TabKey)}
                className="w-full p-2.5 border-gray-200 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition"
                aria-label="Select tab (filter)">
                {TABS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>

              <div className="col-span-1 md:col-span-2 relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search in this tab..."
                  className="w-full p-2.5 border-gray-200 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition"
                  aria-label="Search notes"
                />
              </div>
            </div>

            <div className="mt-3 md:mt-0 flex items-center gap-3">
              <button
                onClick={() => refresh()}
                className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-sm font-medium">
                Refresh
              </button>
              <div className="text-sm text-gray-500 hidden md:block">{filteredNotes.length} Results</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {Object.keys(groupedBySubject).length === 0 && (
            <div className="bg-white p-8 rounded-xl text-center shadow-sm border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">No Notes Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}

          {Object.entries(groupedBySubject).map(([subject, items]) => {
            const isOpen = !!openGroups[subject];
            return (
              <section key={subject} className="bg-white rounded-xl border border-purple-200/80 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleGroup(subject)}
                  aria-expanded={isOpen}
                  className={`w-full flex items-center justify-between p-4 ${THEME.groupHeaderBg} border-b border-purple-200/80`}>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900 text-left">{subject}</h3>
                      <p className="text-sm text-purple-700/80 text-left">{items.length} {items.length === 1 ? 'note' : 'notes'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ChevronDown className={`w-6 h-6 text-purple-600 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                   <div className="p-4 md:p-6 bg-purple-50/20">
                      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                        {items.map((note) => (
                          <NoteCard key={note.id} note={note} compact={compactMode} />
                        ))}
                      </div>
                   </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, compact }: { note: any; compact: boolean }) {
  const { id, title, short, course, year, isPremium } = note;

  return (
    <article className={`group bg-white rounded-xl shadow-sm border border-purple-200/60 transition-all duration-300 hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 flex flex-col`}>
      <div className="p-4 flex-grow">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 leading-tight truncate pr-2">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">{course} • {year || "—"}</p>
          </div>
          {isPremium && (
            <div className="flex-shrink-0 p-1 rounded-full bg-gradient-to-br from-yellow-100 to-amber-200" title="Premium Note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2 6h6l-4.8 3.2L18 20 12 16 6 20l1.2-8.8L2 8h6z" fill="#a16207" />
              </svg>
            </div>
          )}
        </div>
        
        {short && (
          <p className="text-sm text-gray-600 mt-3">{short}</p>
        )}
      </div>
      
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 mt-auto">
        <Link href={`/dashboard/notes/view/${id}`} className={`w-full block text-center bg-gradient-to-br from-purple-600 to-pink-500 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 hover:opacity-90`}>
          Open Note
        </Link>
      </div>
    </article>
  );
}
