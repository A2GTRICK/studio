
// src/app/a2gadmin/notes/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [existingSubjects, setExistingSubjects] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSubjects() {
      const snapshot = await getDocs(collection(db, "notes"));
      const subjects = snapshot.docs.map(doc => doc.data().subject).filter(Boolean);
      setExistingSubjects([...new Set(subjects)].sort());
    }
    fetchSubjects();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const docRef = await addDoc(collection(db, "notes"), {
          title: title.trim(),
          subject: subject.trim(),
          course: course.trim(),
          year: year.trim(),
          topic: topic.trim(),
          universitySyllabus: universitySyllabus.trim(),
          short: shortText.trim(),
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
    <div className="text-foreground">
      <h1 className="text-2xl font-semibold mb-4">Create New Note</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
          <div>
            <Input 
              list="subjects-datalist"
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Subject (e.g., Pharmacology)" 
            />
            <datalist id="subjects-datalist">
              {existingSubjects.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>
          <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course (e.g. B.Pharm)" />
          <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (e.g. 2nd Year)" />
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" />
          <Input value={universitySyllabus} onChange={(e) => setUniversitySyllabus(e.target.value)} placeholder="University / Syllabus (GPAT...)" />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Short summary</label>
          <Input value={shortText} onChange={(e) => setShortText(e.target.value)} placeholder="Short summary" />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">Content (Markdown)</label>
          <div data-color-mode="dark">
            <MDEditor value={content} onChange={(v = "") => setContent(String(v))} height={400} />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">External links (JSON array)</label>
          <Textarea value={externalLinksJson} onChange={(e) => setExternalLinksJson(e.target.value)} className="h-24" placeholder='[{"label":"YouTube","url":"https://..."}]' />
        </div>

        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} /> Is Premium
          </label>
        </div>

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Note"}
          </Button>
          {msg && <span className="ml-4 text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
