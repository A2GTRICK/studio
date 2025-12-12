// src/app/a2gadmin/notes/create/page.tsx
"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function CreateNoteAdminPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [topic, setTopic] = useState("");
  const [universitySyllabus, setUniversitySyllabus] = useState("");
  const [shortText, setShortText] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [content, setContent] = useState<string>("");

  const [externalLinksJson, setExternalLinksJson] = useState<string>("[]");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const docRef = await addDoc(collection(db, "notes"), {
          title,
          subject,
          course,
          year,
          topic,
          universitySyllabus,
          short: shortText,
          isPremium,
          content,
          externalLinks: JSON.parse(externalLinksJson),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
      });
      
      setMsg("Saved successfully! ID: " + docRef.id);
      router.push(`/a2gadmin/notes/edit/${docRef.id}`);

    } catch (err: any) {
      console.error(err);
      setMsg("Network error or server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-white">
      <h1 className="text-2xl font-semibold mb-4">Create New Note</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="p-3 rounded bg-white/10 w-full" required />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="p-3 rounded bg-white/10 w-full" />
          <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course (e.g. B.Pharm)" className="p-3 rounded bg-white/10 w-full" />
          <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (e.g. 2nd Year)" className="p-3 rounded bg-white/10 w-full" />
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="p-3 rounded bg-white/10 w-full" />
          <input value={universitySyllabus} onChange={(e) => setUniversitySyllabus(e.target.value)} placeholder="University / Syllabus (GPAT...)" className="p-3 rounded bg-white/10 w-full" />
        </div>

        <div>
          <label className="block mb-2">Short summary</label>
          <input value={shortText} onChange={(e) => setShortText(e.target.value)} placeholder="Short summary" className="p-3 rounded bg-white/10 w-full" />
        </div>

        <div>
          <label className="block mb-2">Content (Markdown)</label>
          <div className="bg-white/5 p-2 rounded" data-color-mode="dark">
            <MDEditor value={content} onChange={(v = "") => setContent(String(v))} height={400} />
          </div>
        </div>

        <div>
          <label className="block mb-2">External links (JSON array)</label>
          <textarea value={externalLinksJson} onChange={(e) => setExternalLinksJson(e.target.value)} className="w-full p-2 rounded bg-white/10 h-24" placeholder='[{"label":"YouTube","url":"https://..."}]' />
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} /> Is Premium
          </label>
        </div>

        <div>
          <button disabled={loading} className="bg-purple-600 px-4 py-2 rounded">
            {loading ? "Saving..." : "Save Note"}
          </button>
          {msg && <span className="ml-4">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
