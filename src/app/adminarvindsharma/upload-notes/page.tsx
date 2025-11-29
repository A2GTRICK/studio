
"use client";

import { useState } from "react";
import { formatOfflineNotes } from "@/utils/offlineNoteFormatter";

export default function UploadNotesPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [links, setLinks] = useState([""]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  const applyOfflineFormat = () => {
    const formatted = formatOfflineNotes(content);
    setContent(formatted);
    alert("Content formatted professionally (offline).");
  };

  const uploadNote = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("course", course);
      formData.append("year", year);
      formData.append("content", content);
      formData.append("isPremium", String(isPremium));
      formData.append("externalLinks", JSON.stringify(links));

      attachments.forEach((file) =>
        formData.append("attachments", file)
      );

      const res = await fetch("/api/upload-note", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Uploaded successfully!");
        window.location.href = "/adminarvindsharma/dashboard";
      } else {
        alert("Upload failed.");
      }
    } catch (e) {
      alert("Upload error.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          Upload Note <span className="text-purple-600">📄</span>
        </h1>
        <p className="text-gray-600 mb-6">
          Add high-quality, professionally formatted study notes.
        </p>

        <form onSubmit={uploadNote} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input"
              placeholder="Title (e.g., Pharmacognosy Unit 2)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <input
              className="input"
              placeholder="Subject (e.g., Pharmacognosy)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <input
              className="input"
              placeholder="Course (e.g., B.Pharm)"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              required
            />

            <input
              className="input"
              placeholder="Year (e.g., 1st Year)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="font-semibold text-sm text-gray-700 block mb-2">
              Full Content (Markdown supported)
            </label>
            <textarea
              rows={14}
              className="w-full p-4 border rounded-xl bg-gray-50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw text here…"
              required
            ></textarea>

            <button
              type="button"
              onClick={applyOfflineFormat}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
            >
              📝 Auto-Format Offline
            </button>
          </div>

          {/* Attachments */}
          <div>
            <label className="font-semibold block mb-2">
              Attachments (PDF, Images, DOCX)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) =>
                setAttachments(Array.from(e.target.files || []))
              }
            />
          </div>

          {/* Premium toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            Mark as Premium Content
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-purple-600 text-white rounded-xl text-lg shadow-lg hover:bg-purple-700"
          >
            {loading ? "Uploading…" : "Save Note"}
          </button>

          <button
            type="button"
            onClick={() => (window.location.href = "/adminarvindsharma/dashboard")}
            className="w-full py-3 bg-gray-100 rounded-xl"
          >
            ← Back to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
