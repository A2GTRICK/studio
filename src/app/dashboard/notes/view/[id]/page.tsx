
"use client";

import { useParams } from "next/navigation";
import { useNotes } from "@/context/notes-context";

export default function NoteViewPage() {
  const { id } = useParams();
  const { notes } = useNotes();

  const note = notes.find((n) => n.id === id);

  if (!note) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Note Not Found</h1>
        <p className="text-gray-600 mt-2">
          The note you're looking for is not available.
        </p>
        <a
          href="/dashboard/notes"
          className="text-blue-600 mt-4 inline-block font-medium"
        >
          ← Back to Notes Library
        </a>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center px-4 py-6">
      <div className="max-w-3xl w-full space-y-6">

        {/* HEADER CARD */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h1 className="text-3xl font-bold leading-tight">{note.title}</h1>

          <div className="text-gray-600 mt-3 text-sm flex flex-wrap gap-2">
            <span className="font-medium">{note.course}</span>
            {note.year && <span>• {note.year}</span>}
            {note.subject && <span>• {note.subject}</span>}
          </div>

          {note.short && (
            <p className="mt-4 text-gray-700 leading-relaxed text-[15px]">
              {note.short}
            </p>
          )}
        </div>

        {/* CONTENT CARD */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">📘 Full Content</h2>

          {/* Smart content renderer */}
          <div className="prose prose-blue max-w-none">

            {/* If content contains new lines, format MCQs better */}
            <div className="whitespace-pre-wrap text-gray-800 leading-7">
              {formatContent(note.content)}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-start py-6">
          <a
            href="/dashboard/notes"
            className="text-blue-600 font-medium text-sm"
          >
            ← Back to Notes Library
          </a>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------
   FORMATTING FUNCTION FOR CLEAN MCQs + HEADINGS
------------------------------------------------------*/
function formatContent(content: string = "") {
  if (!content) return "No content available.";

  // Make **bold** into <strong>
  content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Make - or * bullets proper
  content = content.replace(/^- (.*)$/gm, "• $1");

  // Replace Google Drive URLs with a beautiful button
  content = content.replace(
    /(https?:\/\/[^\s]+)/g,
    `<a href="$1" target="_blank" class="text-blue-600 underline font-medium">Open Attachment →</a>`
  );

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}
