"use client";
import { useState } from "react";

export default function NotesLibrary() {
  const [search, setSearch] = useState("");

  // Temporary sample notes (later replaced with Firestore data)
  const notes = [
    {
      title: "Pharmacognosy Unit 1",
      description: "Introduction to Pharmacognosy, sources of drugs, classification.",
    },
    {
      title: "Pharmacology – ANS",
      description: "Study of sympathetic & parasympathetic systems with drugs.",
    },
    {
      title: "Pharmaceutics – Dosage Forms",
      description: "Types of dosage forms and formulation basics.",
    },
  ];

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Notes Library</h1>
      <p className="text-gray-600">Your saved & generated notes.</p>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-3 border rounded w-full max-w-md"
      />

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filteredNotes.map((note, index) => (
          <div key={index} className="p-4 bg-white border rounded shadow-sm">
            <h2 className="text-xl font-semibold">{note.title}</h2>
            <p className="text-gray-700 mt-2">{note.description}</p>
            <a
              href="#"
              className="text-blue-600 font-semibold mt-3 inline-block"
            >
              View Note →
            </a>
          </div>
        ))}
      </div>

      {/* If No Notes Found */}
      {filteredNotes.length === 0 && (
        <p className="text-gray-600 mt-6">No notes found for your search.</p>
      )}

    </div>
  );
}
