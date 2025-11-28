// src/app/dashboard/notes/view/[id]/page.tsx
"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import { useNotes } from "@/context/notes-context";

/**
 * Premium A2G Note View (client)
 * - reads notes from useNotes()
 * - supports Markdown + inline HTML + GFM
 * - sanitizes HTML with DOMPurify but allows safe iframe embeds (Drive/YouTube)
 * - auto-embeds Drive / YouTube / PDF / images / audio / office files
 */

/* Theme classes (A2G purple style) */
const THEME = {
  pageBg: "bg-[#F3EBFF]",
  card: "bg-white rounded-2xl shadow-lg border border-[#E3D6FF]",
  accent: "text-[#6B21A8]",
  accentLight: "bg-[#EAD8FF]",
};

function extractDriveId(url: string) {
  // support /d/ID/ and id=... patterns
  let m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return m[1];
  m = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return m[1];
  return "";
}

function toDomain(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/** Convert known links into embed HTML (Drive, YouTube, PDF, images, audio, office files) */
function preprocessContent(raw: string) {
  if (!raw) return "";

  let s = String(raw);

  // 1) Convert Google Drive file links to embed card + iframe
  s = s.replace(
    /(https?:\/\/drive\.google\.com\/[^\s)]+)/g,
    (m) => {
      const id = extractDriveId(m);
      if (id) {
        const preview = `https://drive.google.com/file/d/${id}/preview`;
        return `
<div class="my-6 ${THEME.accentLight} border border-[#D9C9FF] rounded-xl p-4 shadow-sm not-prose">
  <div class="flex items-center gap-3">
    <div class="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-lg flex items-center justify-center text-xl">📎</div>
    <div>
      <p class="font-semibold ${THEME.accent}">Google Drive Attachment</p>
      <a href="${m}" target="_blank" rel="noreferrer" class="text-purple-700 underline text-sm font-medium">Open in Drive →</a>
    </div>
  </div>
  <iframe src="${preview}" class="w-full h-72 rounded-lg mt-4 border border-[#EAD8FF]" allow="autoplay"></iframe>
</div>
`;
      }
      // fallback: show link card
      return `<div class="my-4 p-3 rounded-md bg-[#FFF7FB] border"><a href="${m}" target="_blank" rel="noreferrer" class="text-purple-700 underline">${m}</a></div>`;
    }
  );

  // 2) YouTube links -> responsive iframe
  s = s.replace(
    /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,}))([^\s]*)?/g,
    (_m, full, id) => {
      // id maybe in full; extract numeric id properly
      const videoIdMatch = full.match(/v=([A-Za-z0-9_-]{6,})/) || full.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
      const vid = videoIdMatch ? videoIdMatch[1] : id;
      if (!vid) return full;
      return `
<div class="my-6 rounded-xl overflow-hidden shadow-sm border">
  <div class="w-full" style="position:relative;padding-bottom:56.25%;height:0;">
    <iframe src="https://www.youtube.com/embed/${vid}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe>
  </div>
</div>
`;
    }
  );

  // 3) PDF links -> open card
  s = s.replace(
    /(https?:\/\/[^\s]+\.pdf)/g,
    (m) =>
      `<div class="my-6 ${THEME.card} p-4"><div class="flex items-center gap-3"><div class="h-10 w-10 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl">📄</div><div><p class="font-semibold text-blue-800">PDF Document</p><a href="${m}" target="_blank" rel="noreferrer" class="text-blue-700 underline text-sm">Open PDF →</a></div></div></div>`
  );

  // 4) Image URLs -> embed
  s = s.replace(
    /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp))/gi,
    (m) =>
      `<div class="my-6 text-center"><img src="${m}" alt="note-image" class="rounded-xl border shadow-md mx-auto max-w-full" /></div>`
  );

  // 5) Audio (mp3) -> audio player
  s = s.replace(
    /(https?:\/\/[^\s]+\.mp3)/gi,
    (m) => `<div class="my-4"><audio controls src="${m}" class="w-full"></audio></div>`
  );

  // 6) Office files (.docx, .pptx, .xlsx, .zip) -> download card
  s = s.replace(
    /(https?:\/\/[^\s]+\.(?:docx|pptx|xlsx|zip))/gi,
    (m) =>
      `<div class="my-6 ${THEME.card} p-4"><div class="flex items-center gap-3"><div class="h-10 w-10 bg-gray-800 text-white rounded-lg flex items-center justify-center text-xl">⬇️</div><div><p class="font-semibold">${toDomain(m)}</p><a href="${m}" target="_blank" rel="noreferrer" class="text-gray-700 underline text-sm">Download →</a></div></div></div>`
  );

  // 7) Generic external URLs -> nice link card
  s = s.replace(
    /(https?:\/\/[^\s]+)/g,
    (m) => {
      // if already converted above, skip (already contains iframe etc). Basic guard: if m appears in generated HTML like '<iframe' then skip.
      if (m.includes("/embed") || m.includes("/preview") || m.includes("youtube.com/embed")) return m;
      return `<div class="my-4 p-3 rounded-md ${THEME.accentLight} border border-[#EAD8FF]"><a href="${m}" target="_blank" rel="noreferrer" class="text-purple-700 font-medium underline">${toDomain(m)}</a></div>`;
    }
  );

  return s;
}

/** sanitize allowing iframe + attrs */
function sanitizeForRender(dirty: string) {
  // Allow iframe and common attributes for embeds
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "loading",
      "referrerpolicy",
      "sandbox",
      "target",
    ],
  });
}

/** Main component */
export default function NoteViewPage(): JSX.Element {
  const { id } = useParams();
  const { notes } = useNotes();

  const note = notes.find((n) => n.id === id);

  const preprocessed = useMemo(() => {
    if (!note) return "";
    // prefer note.content; fallback to note.short
    const raw = (note.content ?? note.short ?? "").toString();
    const processed = preprocessContent(raw);
    const sanitized = sanitizeForRender(processed);
    return sanitized;
  }, [note]);

  if (!note) {
    return (
      <div className={`min-h-screen ${THEME.pageBg} flex items-start justify-center p-6`}>
        <div className="max-w-3xl w-full space-y-6">
          <div className={THEME.card + " p-8"}>
            <h1 className="text-2xl font-bold">Note not found</h1>
            <p className="mt-2 text-gray-600">The note you're looking for is missing or not published.</p>
            <a href="/dashboard/notes" className={`${THEME.accent} mt-4 inline-block`}>← Back to Notes Library</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${THEME.pageBg} w-full flex justify-center px-4 py-10`}>
      <div className="max-w-4xl w-full space-y-8">
        {/* Header Card */}
        <div className={THEME.card + " p-8"}>
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl">📘</div>
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{note.title}</h1>
              <div className="text-gray-700 text-sm mt-3 flex flex-wrap gap-3">
                <span className={`${THEME.accent} font-semibold`}>{note.course}</span>
                {note.year && <span>• {note.year}</span>}
                {note.subject && <span>• {note.subject}</span>}
              </div>
              {note.short && <p className="mt-4 text-gray-700">{note.short}</p>}
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className={THEME.card + " p-8"}>
          <div className="flex items-center mb-6">
            <span className="h-4 w-4 rounded bg-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Full Content</h2>
          </div>

          {/* Use ReactMarkdown for rendering sanitized markdown+html with GFM support */}
          <div className="prose max-w-none text-[16px] leading-7 text-gray-900">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-purple-800 mt-6 mb-3" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-purple-700 mt-6 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-purple-600 mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-800 my-2" {...props} />,
                strong: ({node, ...props}) => <strong className="text-purple-700 font-semibold" {...props} />,
                em: ({node, ...props}) => <em className="italic" {...props} />,
                a: ({node, href, ...props}) => <a href={href} target="_blank" rel="noreferrer" className="text-purple-700 underline" {...props} />,
                img: ({node, src, alt, ...props}) => <img src={src} alt={alt || "note-image"} className="rounded-xl border shadow-md mx-auto max-w-full" {...props} />,
                table: ({node, ...props}) => <table className="min-w-full bg-white border-collapse" {...props} />,
                th: ({node, ...props}) => <th className="border bg-[#F3EBFF] p-2 text-left font-semibold" {...props} />,
                td: ({node, ...props}) => <td className="border p-2" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-6 my-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-6 my-2" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-400 pl-4 italic my-4 text-purple-700" {...props} />,
                code: ({node, inline, className, children, ...props}) => (
                  inline ? <code className="bg-gray-100 px-1 rounded text-sm" {...props}>{children}</code> :
                    <pre className="bg-gray-900 text-white rounded p-4 overflow-auto"><code>{children}</code></pre>
                )
              }}
            >
              {preprocessed /* already sanitized HTML+markdown string */}
            </ReactMarkdown>
          </div>
        </div>

        <div>
          <a href="/dashboard/notes" className={`${THEME.accent} font-semibold`}>← Back to Notes Library</a>
        </div>
      </div>
    </div>
  );
}
