"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotesListPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    try {
      const res = await fetch("/api/a2gadmin/notes", { cache: "no-store" });
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Error loading notes:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="text-white">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-wide">Notes Manager</h1>
        <Link
          href="/a2gadmin/notes/create"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl text-white"
        >
          + Add Note
        </Link>
      </div>

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {notes.map((note, idx) => (
            <div
              key={idx}
              className="backdrop-blur-xl bg-white/10 border border-white/20 p-5 rounded-2xl shadow-xl"
            >
              <h2 className="text-xl font-semibold">{note.title}</h2>
              <p className="text-sm opacity-80 mt-1">{note.subject}</p>

              <div className="flex justify-between mt-4">
                <Link
                  href={`/a2gadmin/notes/edit/${note.id}`}
                  className="text-blue-300 hover:text-blue-400"
                >
                  Edit
                </Link>

                <button
                  onClick={async () => {
                    if (!confirm("Delete this note?")) return;
                    await fetch(`/api/a2gadmin/notes?id=${note.id}`, {
                      method: "DELETE",
                    });
                    loadNotes();
                  }}
                  className="text-red-300 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}