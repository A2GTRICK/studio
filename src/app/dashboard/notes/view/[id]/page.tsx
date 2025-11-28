"use client";

import { useParams } from "next/navigation";
import { useNotes } from "@/context/notes-context";

export default function NoteViewPage() {
  const { id } = useParams();   // note id from URL
  const { notes } = useNotes();

  // Find note from context (already loaded from Firestore)
  const note = notes.find(n => n.id === id);

  if (!note) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Note Not Found</h1>
        <p className="text-gray-600 mt-2">This note may not be available or failed to load.</p>
        <a href="/dashboard/notes" className="text-blue-600 mt-4 inline-block">← Back to Notes</a>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold">{note.title}</h1>

        <p className="text-gray-600 mt-2">
          {note.course} {note.year ? `• ${note.year}` : ""}  
          {note.subject ? `• ${note.subject}` : ""}
        </p>

        {note.short && <p className="mt-3 text-gray-700">{note.short}</p>}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border leading-7">
        <h2 className="text-xl font-semibold mb-3">Full Content</h2>

        <div className="whitespace-pre-wrap text-gray-800">
          {note.content || "No full content available for this note."}
        </div>
      </div>

      <a href="/dashboard/notes" className="text-blue-600 font-semibold">
        ← Back to Notes Library
      </a>
    </div>
  );
}
