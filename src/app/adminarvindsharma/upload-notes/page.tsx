// src/app/adminarvindsharma/upload-notes/page.tsx
"use client";

import { useState } from "react";
import { formatNoteOffline } from "@/lib/offlineFormatter";

export default function AdminUploadNotePage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([""]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachments(Array.from(e.target.files || []));
  };

  const handleAddLink = () => setLinks((s) => [...s, ""]);
  const handleLinkChange = (index: number, v: string) =>
    setLinks((s) => s.map((x, i) => (i === index ? v : x)));

  const handleAutoFormat = () => {
    setContent((c) => formatNoteOffline(c));
    setMessage("Content auto-formatted (offline).");
    setTimeout(() => setMessage(null), 3000);
  };

  async function uploadNote(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("course", course);
      formData.append("year", year);
      formData.append("content", content);
      formData.append("isPremium", String(isPremium));
      formData.append("externalLinks", JSON.stringify(links.filter((l) => l.trim() !== "")));

      attachments.forEach((file) => formData.append("attachments", file));

      const res = await fetch("/api/upload-note", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Upload failed");
      }

      setMessage("Note uploaded successfully — visible in Notes Library.");
      // reset form
      setTitle("");
      setSubject("");
      setCourse("");
      setYear("");
      setContent("");
      setAttachments([]);
      setLinks([""]);
      setIsPremium(false);

      setTimeout(() => {
        window.location.href = "/adminarvindsharma/dashboard";
      }, 900);
    } catch (err: any) {
      setMessage("Upload failed: " + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Upload Note <span className="text-purple-600">📄</span></h1>
            <p className="text-gray-600 mt-1">Add high-quality notes (text, PDFs, images, DOCX). Auto-format included.</p>
          </div>
          <button
            onClick={() => (window.location.href = "/adminarvindsharma/dashboard")}
            className="px-3 py-2 bg-white border rounded-md hover:bg-gray-50"
          >
            ← Back
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-md bg-purple-50 text-purple-800 border border-purple-100">
            {message}
          </div>
        )}

        <form onSubmit={uploadNote} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              placeholder="Note Title (e.g., Pharmacology Unit 1)"
              className="p-3 border rounded-lg bg-gray-50"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              name="subject"
              placeholder="Subject (e.g., Pharmacology)"
              className="p-3 border rounded-lg bg-gray-50"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <input
              name="course"
              placeholder="Course (e.g., B.Pharm)"
              className="p-3 border rounded-lg bg-gray-50"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            />
            <input
              name="year"
              placeholder="Year (e.g., 2nd Year)"
              className="p-3 border rounded-lg bg-gray-50"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          <div className="mt-6">
            <label className="font-medium text-gray-700">Full Content (Markdown supported)</label>
            <textarea
              name="content"
              rows={10}
              className="w-full p-4 mt-2 border rounded-lg bg-gray-50"
              placeholder="Paste raw text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="flex gap-2 justify-end mt-3">
              <button
                type="button"
                onClick={handleAutoFormat}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🧹 Auto-Format Offline
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="font-medium text-gray-700">External Links (Google Drive etc.)</label>
            {links.map((l, idx) => (
              <input
                key={idx}
                className="w-full p-3 rounded-lg bg-gray-50 border mt-2"
                placeholder="https://..."
                value={l}
                onChange={(e) => handleLinkChange(idx, e.target.value)}
              />
            ))}
            <button type="button" onClick={handleAddLink} className="text-sm text-blue-600 mt-2">+ Add another link</button>
          </div>

          <div className="mt-6">
            <label className="font-medium text-gray-700">Attachments (PDF, PNG, JPG, DOCX)</label>
            <input type="file" multiple onChange={onFilesChange} className="mt-2" />
            {attachments.length > 0 && (
              <ul className="mt-3 text-sm text-gray-700">
                {attachments.map((f, i) => (
                  <li key={i}>📎 {f.name} <span className="text-gray-400 text-xs">({(f.size/1024/1024).toFixed(2)} MB)</span></li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
              <span>Mark as Premium Content</span>
            </label>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full py-3 text-white bg-purple-600 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? "Uploading…" : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
