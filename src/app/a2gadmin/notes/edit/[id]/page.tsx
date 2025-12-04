"use client";

import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "react-quill/dist/quill.snow.css";

// Load ReactQuill CLIENT-SIDE ONLY (Fixes "document is not defined")
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditNotePage({ params }: any) {
  const { id } = use(params); // REQUIRED FIX FOR NEXT.JS 15

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
    const form = new FormData();

    form.append("title", note.title);
    form.append("subject", note.subject);
    form.append("course", note.course);
    form.append("year", note.year);
    form.append("topic", note.topic);
    form.append("content", note.content);
    form.append("isPremium", note.isPremium ? "true" : "false");

    const res = await fetch(`/api/a2gadmin/notes?id=${id}`, {
      method: "PUT",
      body: form,
    });

    if (res.ok) {
      alert("Note updated successfully!");
      router.push("/a2gadmin/notes");
    } else {
      alert("Update failed!");
    }
  }

  // ----------------------------------------------------
  // PAGE LOADING STATE
  // ----------------------------------------------------
  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Note</h1>

      {/* Title */}
      <label className="block mb-2 font-semibold">Title</label>
      <input
        value={note.title}
        onChange={(e) => setNote({ ...note, title: e.target.value })}
        className="w-full border p-2 rounded mb-4"
        type="text"
      />

      {/* Subject */}
      <label className="block mb-2 font-semibold">Subject</label>
      <input
        value={note.subject}
        onChange={(e) => setNote({ ...note, subject: e.target.value })}
        className="w-full border p-2 rounded mb-4"
        type="text"
      />

      {/* Course */}
      <label className="block mb-2 font-semibold">Course</label>
      <input
        value={note.course}
        onChange={(e) => setNote({ ...note, course: e.target.value })}
        className="w-full border p-2 rounded mb-4"
        type="text"
      />

      {/* Year */}
      <label className="block mb-2 font-semibold">Year</label>
      <input
        value={note.year}
        onChange={(e) => setNote({ ...note, year: e.target.value })}
        className="w-full border p-2 rounded mb-4"
        type="text"
      />

      {/* Topic */}
      <label className="block mb-2 font-semibold">Topic</label>
      <input
        value={note.topic}
        onChange={(e) => setNote({ ...note, topic: e.target.value })}
        className="w-full border p-2 rounded mb-4"
        type="text"
      />

      {/* Premium Toggle */}
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
      <div className="bg-white border rounded mb-6">
        <ReactQuill
          theme="snow"
          value={note.content}
          onChange={(html) => setNote({ ...note, content: html })}
          className="h-80"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={saveNote}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
