
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
   HELPER FUNCTION FOR GOOGLE DRIVE
-------------------------------------------------------------*/
function extractDriveId(url: string) {
  const match = url.match(/\/d\/(.*)\//);
  return match ? match[1] : "";
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


/* ------------------------------------------------------------
   CUSTOM FORMATTING ENGINE — MCQs, Bold, Lists, Links, Tables
-------------------------------------------------------------*/
function renderFormattedContent(content: string = "") {

  // PREMIUM ATTACHMENT DETECTOR
  content = content.replace(
    /(https?:\/\/[^\s]+)/g,
    (url: string) => {
      // Google Drive file
      if (url.includes("drive.google.com")) {
        const fileId = extractDriveId(url);
        if (!fileId) {
            // Fallback for invalid Drive URL
            return `<a href="${url}" target="_blank" class="text-purple-700 font-semibold underline">${url}</a>`;
        }
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;

        return `
        <div class="my-6 bg-[#F7F0FF] border border-purple-300 rounded-xl p-4 shadow-sm not-prose">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xl shrink-0">📎</div>
            <div>
              <p class="font-semibold text-purple-800">Google Drive Attachment</p>
              <a href="${url}" target="_blank" class="text-purple-700 underline text-sm font-medium">Open in Drive →</a>
            </div>
          </div>
          <iframe 
            src="${previewUrl}"
            class="w-full h-64 rounded-lg mt-4 border border-purple-200"
            allow="autoplay"
          ></iframe>
        </div>
        `;
      }

      // PDF File
      if (url.endsWith(".pdf")) {
        return `
          <div class="my-6 bg-[#F0F8FF] border border-blue-300 rounded-xl p-4 shadow-sm not-prose">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl shrink-0">📄</div>
              <div>
                <p class="font-semibold text-blue-800">PDF Document</p>
                <a href="${url}" target="_blank" class="text-blue-700 underline text-sm font-medium">Open PDF →</a>
              </div>
            </div>
          </div>
        `;
      }

      // Image File
      if (url.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
        return `
        <div class="my-6 text-center not-prose">
          <img 
            src="${url}" 
            class="rounded-xl border shadow-md mx-auto max-w-full"
          />
        </div>
        `;
      }

      // Default hyperlink
      return `<a href="${url}" target="_blank" class="text-purple-700 font-semibold underline">${url}</a>`;
    }
  );


  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-purple-800" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-2xl font-bold mt-8 mb-3 text-purple-700" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-xl font-semibold mt-6 mb-2 text-purple-600" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-lg font-semibold mt-4 mb-2 text-purple-600" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-gray-800 leading-7 my-2" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="text-purple-700 font-semibold" {...props} />
        ),
        img: ({ node, src, alt, ...props }) => (
          <img
            src={src || ""}
            alt={alt || ""}
            className="rounded-xl border mx-auto my-4 shadow-md max-w-full"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-6"><table className="w-full border-collapse bg-white" {...props} /></div>
        ),
        th: ({ node, ...props }) => (
          <th className="border bg-purple-100 p-2 text-left font-semibold" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="border p-2" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc ml-6 my-3 text-gray-800" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal ml-6 my-3 text-gray-800" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-purple-400 pl-4 my-4 text-purple-700 italic" {...props} />
        ),
        a: ({ node, href, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-700 underline font-medium"
            {...props}
          />
        ),
        code: ({ node, ...props }) => (
          <code className="bg-gray-200 px-2 py-1 rounded text-sm" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
