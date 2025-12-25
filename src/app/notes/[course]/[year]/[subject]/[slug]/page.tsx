
import React from 'react';
import { fetchAllNotes, Note } from "@/services/notes";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* =============================================================================
   SEO-ONLY PUBLIC NOTE PAGE
   Purpose:
   - Google indexing & Topic discovery
   - High-quality preview to drive dashboard signups
============================================================================= */

// Simple Icon Components to replace Lucide dependency for preview stability
const CheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);


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

type Props = {
  params: {
    course: string;
    year: string;
    subject: string;
    slug: string;
  };
};

async function getNote(params: Props["params"]): Promise<Note | null> {
  const notes = await fetchAllNotes();

  const decodedCourse = decodeURIComponent(params.course);
  const decodedYear = decodeURIComponent(params.year);
  const decodedSubject = decodeURIComponent(params.subject);

  const note = notes.find((n) => n.id === params.slug);

  if (
    note &&
    note.course === decodedCourse &&
    note.year === decodedYear &&
    note.subject === decodedSubject
  ) {
    return note;
  }

  return null;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const note = await getNote(params);
  if (!note) return {};

  const course = decodeURIComponent(params.course);
  const year = decodeURIComponent(params.year);
  const subject = decodeURIComponent(params.subject);

  const title = `${note.title} | ${subject} Notes | ${course} ${year}`;
  const description =
    (note as any).seoSummary ||
    `Syllabus-aligned ${subject} notes for ${course} ${year}. Preview topics covered and read full structured notes inside the pharmA2G dashboard.`;

  const url = `${
    process.env.NEXT_PUBLIC_BASE_URL || "https://pharma2g.com"
  }/notes/${params.course}/${params.year}/${params.subject}/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
  };
}

export default async function PublicNotePage({ params }: Props) {
  const note = await getNote(params);
  if (!note) notFound();

  const isPremium = note.isPremium === true;

  const summary =
    (note as any).seoSummary ||
    sanitizeText(note.short || note.content || "").slice(0, 280);

  const points =
    (note as any).seoPoints && (note as any).seoPoints.length > 0
      ? (note as any).seoPoints
      : sanitizeText(note.content || "")
          .split("\n")
          .filter((line) => line.length > 20)
          .slice(0, 5);
          
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl font-sans text-slate-900 bg-white">
      {/* HEADER */}
      <h1 className="text-4xl font-extrabold tracking-tight">{note.title}</h1>
      
      <p className="mt-3 text-sm font-semibold text-blue-600">
        This is a preview for discovery. Full structured notes are available inside the pharmA2G dashboard.
      </p>

      <p className="text-slate-500 mt-2 text-base font-medium">
        {note.course} • {note.year} • {note.subject}
      </p>

      {/* SUMMARY */}
      {summary && (
        <section className="mt-10">
          <h2 className="text-2xl font-bold border-b pb-3">Summary</h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed italic">
            &quot;{summary}...&quot;
          </p>
        </section>
      )}

      {/* TOPICS COVERED */}
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

      {/* CTA SECTION */}
      <div className="mt-14 text-center p-10 border border-slate-200 rounded-2xl bg-slate-50 shadow-sm">
        <div className="mb-4 inline-block p-3 bg-blue-100 rounded-full">
           <LockIcon />
        </div>
        
        <h3 className="font-extrabold text-2xl">
          Read the full structured notes
        </h3>

        <p className="text-slate-500 mt-3 text-base max-w-md mx-auto leading-relaxed">
          Detailed explanations, examples, and downloadable resources are
          available inside the pharmA2G dashboard.
        </p>

        <Button asChild className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            <Link href={`/dashboard/notes/view/${note.id}`}>
                Read Full Notes in Dashboard
            </Link>
        </Button>

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
