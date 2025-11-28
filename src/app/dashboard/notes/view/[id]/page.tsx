
"use client";

import { useParams } from "next/navigation";
import { useNotes } from "@/context/notes-context";

/* ------------------------------------------------------------
   A2G PREMIUM PURPLE THEME
-------------------------------------------------------------*/
const theme = {
  bg: "bg-[#F3EBFF]",                    // Soft lavender background
  card: "bg-white rounded-2xl shadow-lg border border-[#E3D6FF]",
  accent: "text-[#6B21A8]",              // Deep purple
  accentBg: "bg-[#EAD8FF]",              // Light purple highlight
  iconBlue: "bg-[#4F46E5]"               // Indigo accent
};

export default function NoteViewPage() {
  const { id } = useParams();
  const { notes } = useNotes();

  const note = notes.find((n) => n.id === id);

  if (!note) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Note Not Found</h1>
        <p className="text-gray-600 mt-2">
          This note is not available.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} w-full flex justify-center px-4 py-10`}>
      <div className="max-w-3xl w-full space-y-8">

        {/* HEADER CARD */}
        <div className={`${theme.card} p-8`}>
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
              📘
            </div>
            <h1 className="text-3xl font-extrabold ml-4 leading-tight text-gray-900">
              {note.title}
            </h1>
          </div>

          {/* Meta Info */}
          <div className="text-gray-700 text-sm flex flex-wrap gap-3 mt-4">
            <span className={`${theme.accent} font-semibold`}>{note.course}</span>
            {note.year && <span>• {note.year}</span>}
            {note.subject && <span>• {note.subject}</span>}
          </div>

          {note.short && (
            <p className="mt-5 text-gray-700 leading-relaxed text-[15px]">
              {note.short}
            </p>
          )}
        </div>

        {/* FULL CONTENT CARD */}
        <div className={`${theme.card} p-8`}>
          {/* Section Heading */}
          <div className="flex items-center mb-6">
            <span className="h-4 w-4 rounded bg-blue-500 mr-2"></span>
            <h2 className="text-xl font-bold text-gray-900">Full Content</h2>
          </div>

          {/* FORMATTED CONTENT */}
          <div className="prose max-w-none text-[16px] leading-8 text-gray-900">
            {renderFormattedContent(note.content)}
          </div>
        </div>

        {/* BACK BUTTON */}
        <a
          href="/dashboard/notes"
          className={`${theme.accent} font-semibold text-sm hover:underline`}
        >
          ← Back to Notes Library
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   CUSTOM FORMATTING ENGINE — MCQs, Bold, Lists, Links, Tables
-------------------------------------------------------------*/
function renderFormattedContent(content: string = "") {

  // Bold text marked by **
  content = content.replace(/\*\*(.*?)\*\*/g, "<strong class='text-purple-700'>$1</strong>");

  // Replace Google Drive / links with purple buttons
  content = content.replace(
    /(https?:\/\/[^\s]+)/g,
    `<a 
       href="$1"
       target="_blank"
       class="px-4 py-2 inline-block mt-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
     >
       📎 Open Attachment
     </a>`
  );

  // MCQ options (a), b), c), d))
  content = content.replace(
    /^[a-d]\)\s(.*)$/gm,
    `<div class="ml-4 text-gray-800">• $1</div>`
  );

  // Section separators
  content = content.replace(/---/g, `<hr class="my-6 border-purple-200">`);

  // Headings (like "1. Something")
  content = content.replace(
    /^\d+\.\s(.*)$/gm,
    `<h3 class="text-lg font-semibold text-purple-800 mt-6 mb-2">$1</h3>`
  );

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}
