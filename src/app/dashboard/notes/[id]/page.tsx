
// src/app/dashboard/notes/[id]/page.tsx
"use client";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";

type NoteData = {
  title: string;
  short: string;
  content: string;
  course: string;
  year: string;
  subject: string;
  createdAt: Date | null;
};

export default function NoteView({ params }: { params: { id: string } }) {
  const { id } = params;
  const [note, setNote] = useState<NoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "notes", id);
        const snap = await getDoc(docRef);

        if (!snap.exists()) {
          setError("Note not found.");
        } else {
          const data = snap.data() as any;
          setNote({
            title: data.title || "Untitled",
            short: data.short || data.description || "",
            content: data.notes || data.content || data.body || "",
            course: data.course || "General",
            year: data.year || "",
            subject: data.subject || "",
            createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : null,
          });
        }
      } catch (err: any) {
        console.error("Client fetch note error:", err);
        setError("An error occurred while loading the note.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading note...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-destructive">{error}</h1>
        <p className="text-gray-600 mt-2">The note you requested does not exist or was removed.</p>
        <a href="/dashboard/notes" className="text-blue-600 mt-4 inline-block">← Back to Notes Library</a>
      </div>
    );
  }

  if (!note) {
    return null; // Should be handled by loading/error states
  }

  const createdAtStr = note.createdAt ? format(note.createdAt, "d MMM yyyy, HH:mm") : "";

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold">{note.title}</h1>
        <div className="text-sm text-gray-600 mt-2">
          <span>{note.course}</span>
          {note.year ? <> • <span>{note.year}</span></> : null}
          {note.subject ? <> • <span>{note.subject}</span></> : null}
          {createdAtStr ? <> • <span>{createdAtStr}</span></> : null}
        </div>
        {note.short ? <p className="mt-3 text-gray-700">{note.short}</p> : null}
      </div>

      <article className="bg-white p-6 rounded-xl shadow-sm border leading-7">
        <h2 className="text-xl font-semibold mb-4">Full Notes</h2>
        {/<[a-z][\s\S]*>/i.test(note.content) ? (
          <div dangerouslySetInnerHTML={{ __html: note.content }} />
        ) : (
          <pre className="whitespace-pre-wrap text-gray-800">{note.content}</pre>
        )}
      </article>

      <a href="/dashboard/notes" className="text-blue-600 font-semibold">← Back to Notes Library</a>
    </div>
  );
}
