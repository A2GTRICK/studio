"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import DOMPurify from "dompurify";
import Image from "next/image";

import { db } from "@/firebase/config";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";

import { ArrowLeft, Share2, FileDown, BookText, Menu } from "lucide-react";

// THEME
const THEME = {
  pageBg: "bg-[#F5F1FF]",
  card: "bg-white rounded-2xl shadow-xl border border-[#E5DAFF]",
  accent: "text-[#6B21A8]",
  accentBg: "bg-[#EAD8FF]",
};

// PREPROCESS EMBEDS (Drive, YouTube, PDFs, images, audio)
function preprocessContent(raw: string) {
  if (!raw) return "";
  let s = raw;

  // Google Drive
  s = s.replace(/https?:\/\/drive\.google\.com\/[^\s)]+/g, (m) => {
    const idMatch = m.match(/\/d\/([^/]+)\//) || m.match(/id=([^&]+)/);
    const id = idMatch ? idMatch[1] : "";
    if (!id) return m;

    return `
<div class="my-6 p-4 rounded-xl border bg-[#F9F0FF] shadow-sm not-prose">
  <p class="font-semibold text-purple-700">Google Drive File</p>
  <iframe src="https://drive.google.com/file/d/${id}/preview" class="w-full h-72 rounded-lg mt-3"></iframe>
</div>
`;
  });

  // YouTube
  s = s.replace(
    /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,}))/g,
    (_m, full) => {
      const idMatch = full.match(/v=([^&]+)/) || full.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
      const id = idMatch ? idMatch[1] : "";
      if (!id) return full;

      return `
<div class="my-6 rounded-xl overflow-hidden shadow-sm border">
  <div style="position: relative; padding-bottom: 56.25%; height: 0;">
    <iframe src="https://www.youtube.com/embed/${id}" 
      class="absolute top-0 left-0 w-full h-full"
      allowfullscreen></iframe>
  </div>
</div>`;
    }
  );

  // PDFs
  s = s.replace(/https?:\/\/[^\s]+\.pdf/g, (m) => {
    return `
<div class="my-6 p-4 rounded-xl border shadow-sm bg-[#F5FBFF] not-prose">
  <p class="font-semibold text-blue-700">PDF Document</p>
  <a href="${m}" target="_blank" class="underline text-blue-600">Open PDF →</a>
</div>`;
  });

  return s;
}

// SANITIZE
function sanitizeForRender(dirty: string) {
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "loading", "src", "class"],
  });
}

export default function PremiumNoteViewPage() {
  const { id } = useParams();

  const [note, setNote] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTOC, setShowTOC] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);

      const ref = doc(db, "notes", id as string);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setNote(data);

        // FETCH RELATED NOTES
        const q = query(
          collection(db, "notes"),
          where("course", "==", data.course),
          where("subject", "==", data.subject),
          where("year", "==", data.year),
          limit(5)
        );

        const docs = await getDocs(q);

        const rel = docs.docs
          .filter((d) => d.id !== snap.id)
          .map((d) => ({ id: d.id, ...d.data() }));

        setRelated(rel);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  const sanitized = useMemo(() => {
    if (!note) return "";
    const processed = preprocessContent(note.content || note.short || "");
    return sanitizeForRender(processed);
  }, [note]);

  if (loading)
    return <div class="min-h-screen flex justify-center items-center text-xl">Loading...</div>;

  if (!note)
    return <div class="min-h-screen flex justify-center items-center text-xl">Note Not Found</div>;

  const created = new Date(note.createdAt?.seconds * 1000 || Date.now());

  return (
    <div class={`${THEME.pageBg} min-h-screen pb-20`}>

      {/* Sticky Header */}
      <div class="sticky top-0 z-40 bg-white border-b shadow-sm px-4 py-3 flex justify-between items-center">
        <div class="font-bold text-purple-700 line-clamp-1">{note.title}</div>
        <button
          onClick={() => setShowTOC(true)}
          class="md:hidden p-2 rounded-lg border text-sm"
        >
          <Menu class="w-4 h-4" />
        </button>
      </div>

      {/* MAIN WRAPPER */}
      <div class="max-w-6xl mx-auto px-4 lg:flex gap-10 mt-8">

        {/* LEFT CONTENT */}
        <div class="flex-1">

          {/* Back Button */}
          <Link href="/dashboard/notes" class="inline-flex items-center text-purple-700 mb-6">
            <ArrowLeft class="mr-2 w-4" /> Back to Notes
          </Link>

          {/* HEADER CARD */}
          <div class={`${THEME.card} p-8 mb-8`}>
            <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900">{note.title}</h1>

            <p class="text-gray-600 mt-2">
              {note.course} • {note.subject} • Year {note.year}
            </p>

            <p class="mt-3 text-gray-700">{note.short}</p>

            <div class="mt-4 flex gap-4">
              {/* Share */}
              <button
                onClick={() => {
                  navigator.share({
                    title: note.title,
                    text: "Check this pharmacy note",
                    url: window.location.href,
                  });
                }}
                class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                <Share2 class="w-4" /> Share
              </button>

              {/* Download PDF */}
              <button
                onClick={() => window.print()}
                class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <FileDown class="w-4" /> Download PDF
              </button>
            </div>
          </div>

          {/* CONTENT CARD */}
          <div class={`${THEME.card} p-8 prose max-w-none`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: (props) => <h1 class="text-3xl font-bold text-purple-800" {...props} />,
                h2: (props) => <h2 class="text-2xl font-semibold text-purple-700" {...props} />,
                h3: (props) => <h3 class="text-xl font-semibold text-purple-600" {...props} />,
                table: (props) => <table class="w-full border mt-4" {...props} />,
                th: (props) => <th class="p-2 bg-purple-100 border" {...props} />,
                td: (props) => <td class="p-2 border" {...props} />,
              }}
            >
              {sanitized}
            </ReactMarkdown>
          </div>

          {/* RELATED NOTES */}
          {related.length > 0 && (
            <div class={`${THEME.card} p-6 mt-10`}>
              <h3 class="text-xl font-bold mb-4 text-purple-700 flex items-center gap-2">
                <BookText class="w-5" /> Related Notes
              </h3>
              <div class="space-y-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/dashboard/notes/view/${r.id}`}
                    class="block p-4 border rounded-lg hover:bg-purple-50"
                  >
                    <p class="font-semibold">{r.title}</p>
                    <p class="text-sm text-gray-600">{r.course} • {r.subject}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR (Desktop) */}
        <aside class="hidden lg:block w-72 sticky top-20 h-fit">
          <div class={`${THEME.card} p-6`}>
            <h3 class="font-bold text-lg mb-3">Note Info</h3>
            <p class="text-sm text-gray-700">
              <strong>Author:</strong> pharmA2G Team
            </p>
            <p class="text-sm text-gray-700 mt-1">
              <strong>Published:</strong> {created.toLocaleDateString()}
            </p>
          </div>
        </aside>
      </div>

      {/* MOBILE TOC */}
      {showTOC && (
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50">
          <div class="absolute right-0 top-0 w-72 h-full bg-white p-6 shadow-lg">
            <button class="mb-6" onClick={() => setShowTOC(false)}>
              Close
            </button>
            <h3 class="font-bold text-lg mb-3">Reading Tools</h3>
            <p class="text-sm text-gray-600">Author: pharmA2G Team</p>
          </div>
        </div>
      )}
    </div>
  );
}