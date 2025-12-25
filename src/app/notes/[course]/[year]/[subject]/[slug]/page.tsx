
import React from 'react';

/* =============================================================================
   SEO-ONLY PUBLIC NOTE PAGE (PREVIEW VERSION)
   Purpose:
   - Google indexing & Topic discovery
   - High-quality preview to drive dashboard signups
   - Mocked for Canvas Preview to avoid resolution errors
============================================================================= */

// Mocking the types and data since the build environment cannot resolve local imports
interface Note {
  id: string;
  title: string;
  course: string;
  year: string;
  subject: string;
  isPremium?: boolean;
  content?: string;
  short?: string;
  seoSummary?: string;
  seoPoints?: string[];
}

/**
 * Removes links, embeds, and URLs to prevent premium leakage
 */
function sanitizeText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/gi, "$1")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Simple Icon Components to replace Lucide dependency for preview stability
const CheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

export default function PublicNotePage() {
  // Mocking the data that would normally come from the 'getNote' async function
  const note: Note = {
    id: "sample-id",
    title: "Mechanism of Action: Beta-Adrenergic Blockers",
    course: "B.Pharm",
    year: "3rd Year",
    subject: "Pharmacology",
    isPremium: true,
    content: "Beta-blockers work by blocking the effects of the hormone epinephrine, also known as adrenaline. When you take beta blockers, your heart beats more slowly and with less force, which lowers blood pressure. Beta blockers also help open up veins and arteries to improve blood flow.",
    seoPoints: [
      "Classification based on receptor selectivity (beta-1 vs beta-2)",
      "Pharmacokinetic properties and bioavailability factors",
      "Mechanism of competitive antagonism at sympathetic nerve endings",
      "Clinical applications in hypertension and angina pectoris"
    ]
  };

  const isPremium = note.isPremium === true;
  const summary = note.seoSummary || sanitizeText(note.short || note.content || "").slice(0, 280);
  const points = note.seoPoints || [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl font-sans text-slate-900 bg-white">
      {/* ------------------------------------------------------------------ */}
      {/* HEADER */}
      {/* ------------------------------------------------------------------ */}
      <h1 className="text-4xl font-extrabold tracking-tight">{note.title}</h1>
      
      {/* Correction 1: Clear preview notice */}
      <p className="mt-3 text-sm font-semibold text-blue-600">
        This is a preview for discovery. Full structured notes are available inside the pharmA2G dashboard.
      </p>

      <p className="text-slate-500 mt-2 text-base font-medium">
        {note.course} • {note.year} • {note.subject}
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* SUMMARY */}
      {/* ------------------------------------------------------------------ */}
      {summary && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold border-b pb-3">Summary</h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed italic">
            &quot;{summary}...&quot;
          </p>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TOPICS COVERED */}
      {/* ------------------------------------------------------------------ */}
      {points.length > 0 && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold border-b pb-3">Topics Covered</h2>
          <ul className="mt-5 space-y-4">
            {points.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-600 text-lg">
                <span className="mt-1 shrink-0"><CheckCircle /></span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* CTA SECTION */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-14 text-center p-10 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
        <div className="mb-4 inline-block p-3 bg-blue-100 rounded-full">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        
        <h3 className="font-extrabold text-2xl">
          Read the full structured notes
        </h3>

        <p className="text-slate-500 mt-3 text-base max-w-md mx-auto leading-relaxed">
          {/* Correction 2: Misleading download copy fixed */}
          Detailed explanations, examples, and downloadable resources are
          available inside the pharmA2G dashboard.
        </p>

        <button className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            {/* Correction 3: Explicit CTA copy */}
            Read Full Notes in Dashboard
        </button>

        {/* Correction 4: Premium transparency */}
        {isPremium && (
          <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Premium note • Full access requires login
          </p>
        )}
      </div>

      <footer className="mt-20 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} pharmA2G. All rights reserved.
      </footer>
    </div>
  );
}
