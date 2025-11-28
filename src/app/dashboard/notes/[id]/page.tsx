// src/app/dashboard/notes/[id]/page.tsx
import { adminDb } from "@/lib/firebaseAdmin";
import React from "react";
import { format } from "date-fns";

type Props = {
  params: {
    id: string;
  };
};

export const revalidate = 0; // don't cache for now (use ISR if you want caching)

export default async function NoteView({ params }: Props) {
  const { id } = params;

  // fetch note from Firestore using admin SDK (server-side)
  try {
    const docRef = adminDb.collection("notes").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold">Note not found</h1>
          <p className="text-gray-600 mt-2">The note you requested does not exist or was removed.</p>
          <a href="/dashboard/notes" className="text-blue-600 mt-4 inline-block">← Back to Notes Library</a>
        </div>
      );
    }

    const data = snap.data() as any;

    const title = data.title || "Untitled";
    const short = data.short || data.description || "";
    const content = data.notes || data.content || data.body || "";
    const course = data.course || "General";
    const year = data.year || "";
    const subject = data.subject || "";
    const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null;
    const createdAtStr = createdAt ? format(createdAt, "d MMM yyyy, HH:mm") : "";

    return (
      <div className="space-y-6 p-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="text-sm text-gray-600 mt-2">
            <span>{course}</span>
            {year ? <> • <span>{year}</span></> : null}
            {subject ? <> • <span>{subject}</span></> : null}
            {createdAtStr ? <> • <span>{createdAtStr}</span></> : null}
          </div>
          {short ? <p className="mt-3 text-gray-700">{short}</p> : null}
        </div>

        <article className="bg-white p-6 rounded-xl shadow-sm border leading-7">
          <h2 className="text-xl font-semibold mb-4">Full Notes</h2>
          {/* If content is HTML, render as HTML; otherwise show plain text */}
          {/<[a-z][\s\S]*>/i.test(content) ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <pre className="whitespace-pre-wrap text-gray-800">{content}</pre>
          )}
        </article>

        <a href="/dashboard/notes" className="text-blue-600 font-semibold">← Back to Notes Library</a>
      </div>
    );
  } catch (err: any) {
    console.error("Server fetch note error:", err);
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Error</h1>
        <p className="text-gray-600 mt-2">An error occurred while loading the note.</p>
        <pre className="mt-4 text-sm text-red-600">{String(err.message || err)}</pre>
        <a href="/dashboard/notes" className="text-blue-600 mt-4 inline-block">← Back to Notes Library</a>
      </div>
    );
  }
}
