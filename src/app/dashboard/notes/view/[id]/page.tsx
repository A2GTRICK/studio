
"use client";

import { useParams } from "next/navigation";
import { useNotes } from "@/context/notes-context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import React from 'react';


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

/* ------------------------------------------------------------
   CUSTOM FORMATTING ENGINE — MCQs, Bold, Lists, Links, Tables
-------------------------------------------------------------*/
function renderFormattedContent(content: string = "") {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-purple-800">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold mt-8 mb-3 text-purple-700">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-semibold mt-6 mb-2 text-purple-600">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-lg font-semibold mt-4 mb-2 text-purple-600">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="text-gray-800 leading-7 my-2">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="text-purple-700 font-semibold">{children}</strong>
        ),
        img: ({ src, alt }) => (
          <img
            src={src || ""}
            alt={alt || ""}
            className="rounded-xl border mx-auto my-4 shadow-md max-w-full"
          />
        ),
        table: ({ children }) => (
          <table className="w-full border-collapse bg-white my-6">{children}</table>
        ),
        th: ({ children }) => (
          <th className="border bg-purple-100 p-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border p-2">{children}</td>
        ),
        ul: ({ children }) => (
          <ul className="list-disc ml-6 my-3 text-gray-800">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal ml-6 my-3 text-gray-800">{children}</ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-purple-400 pl-4 my-4 text-purple-700 italic">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-700 underline font-medium"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="bg-gray-200 px-2 py-1 rounded text-sm">{children}</code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}


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
