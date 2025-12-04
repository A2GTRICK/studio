"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Load MDEditor CLIENT-SIDE ONLY
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditNotePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<any>({
    title: "",
    subject: "",
    course: "",
    year: "",
    topic: "",
    isPremium: false,
    content: "",
  });

  // ----------------------------------------------------
  // LOAD NOTE DETAILS
  // ----------------------------------------------------
  useEffect(() => {
    if (!id) return;

    async function loadNote() {
      try {
        const res = await fetch(`/api/a2gadmin/notes?id=${id}`);
        const data = await res.json();

        if (data?.note) {
          setNote({
            title: data.note.title || "",
            subject: data.note.subject || "",
            course: data.note.course || "",
            year: data.note.year || "",
            topic: data.note.topic || "",
            isPremium: data.note.isPremium || false,
            content: data.note.content || "",
          });
        }
      } catch (err) {
        console.error("Failed to load note", err);
      }

      setLoading(false);
    }

    loadNote();
  }, [id]);

  // ----------------------------------------------------
  // SAVE/UPDATE NOTE
  // ----------------------------------------------------
  async function saveNote() {
    const formData = new FormData();

    formData.append("title", note.title);
    formData.append("subject", note.subject);
    formData.append("course", note.course);
    formData.append("year", note.year);
    formData.append("topic", note.topic);
    formData.append("content", note.content);
    formData.append("isPremium", note.isPremium ? "true" : "false");

    const res = await fetch(`/api/a2gadmin/notes?id=${id}`, {
      method: "PUT",
      body: formData,
    });

    if (res.ok) {
      alert("Note updated successfully!");
      router.push("/a2gadmin/notes");
    } else {
      alert("Update failed!");
    }
  }
  
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="text-white max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Note</h1>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} placeholder="Title" className="p-3 rounded bg-white/10 w-full" required />
        <input value={note.subject} onChange={(e) => setNote({ ...note, subject: e.target.value })} placeholder="Subject" className="p-3 rounded bg-white/10 w-full" />
        <input value={note.course} onChange={(e) => setNote({ ...note, course: e.target.value })} placeholder="Course" className="p-3 rounded bg-white/10 w-full" />
        <input value={note.year} onChange={(e) => setNote({ ...note, year: e.target.value })} placeholder="Year" className="p-3 rounded bg-white/10 w-full" />
      </div>

       <div className="mb-4">
          <input value={note.topic} onChange={(e) => setNote({ ...note, topic: e.target.value })} placeholder="Topic" className="p-3 rounded bg-white/10 w-full" />
       </div>


      <label className="flex items-center gap-3 mb-4">
        <input
          type="checkbox"
          checked={note.isPremium}
          onChange={(e) =>
            setNote({ ...note, isPremium: e.target.checked })
          }
        />
        <span className="font-semibold">Mark as Premium</span>
      </label>

      {/* Content Editor */}
      <label className="block mb-2 font-semibold">Content</label>
      <div className="bg-white/5 p-2 rounded mb-6">
        <MDEditor
          value={note.content}
          onChange={(v = "") => setNote({ ...note, content: String(v) })}
          height={400}
        />
      </div>

      <button
        onClick={saveNote}
        className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Save Changes
      </button>
    </div>
  );
}
