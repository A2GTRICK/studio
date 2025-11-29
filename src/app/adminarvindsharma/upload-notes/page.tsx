
"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { formatOfflineNotes } from "@/utils/offlineNoteFormatter";
import { useRouter } from "next/navigation";

export default function UploadNotesPage() {
  const router = useRouter();
  // Form fields
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");

  const [isPremium, setIsPremium] = useState(false);
  const [mode, setMode] = useState<"manual" | "drive">("manual");
  const [driveLink, setDriveLink] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const saveNote = async () => {
    if (!title || !course || !year || !subject) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    const body = {
      title,
      course,
      year,
      subject,
      thumbnail,
      isPremium,
      content: mode === "manual" ? content : "",
      driveLink: mode === "drive" ? driveLink : "",
    };

    const res = await fetch("/api/notes/add", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.success) {
      alert("Error: " + data.message);
    } else {
      alert("Note added successfully!");
      router.push("/adminarvindsharma/dashboard");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F3FF] p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white shadow-md border border-purple-200 rounded-2xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-purple-700">Add New Note</h1>
          <p className="text-gray-600 mt-1">
            Use this form to add a new note to the library.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 shadow-xl border border-purple-200 rounded-2xl">
          
          {/* Title */}
          <label className="font-semibold text-gray-700">Note Title / Topic</label>
          <input
            className="w-full p-3 rounded-xl mt-1 border border-gray-300 bg-gray-50 focus:ring-purple-500"
            placeholder="e.g., Human Anatomy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* Course */}
            <div>
              <label className="font-semibold text-gray-700">Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-50 mt-1"
              >
                <option value="">Select Course</option>
                <option>B.Pharm</option>
                <option>D.Pharm</option>
                <option>M.Pharm</option>
                <option>MCQ Bank</option>
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="font-semibold text-gray-700">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-3 border rounded-xl bg-gray-50 mt-1"
              >
                <option value="">Select Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="mt-6">
            <label className="font-semibold text-gray-700">Subject</label>
            <input
              className="w-full p-3 border rounded-xl bg-gray-50 mt-1"
              placeholder="e.g., Pharmacology"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Thumbnail */}
          <div className="mt-6">
            <label className="font-semibold text-gray-700">
              Thumbnail Image URL (optional)
            </label>
            <input
              className="w-full p-3 border rounded-xl bg-gray-50 mt-1"
              placeholder="https://your-image.jpg"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>

          {/* Premium Toggle */}
          <label className="flex items-center gap-3 mt-6 font-medium text-purple-700">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="w-5 h-5"
            />
            Mark as Premium
          </label>

          {/* Entry Mode Tabs */}
          <div className="flex mt-8 bg-purple-100 rounded-xl overflow-hidden">
            <button
              className={`w-1/2 py-3 font-semibold ${
                mode === "manual" ? "bg-purple-600 text-white" : ""
              }`}
              onClick={() => setMode("manual")}
            >
              ✍ Manual Entry
            </button>
            <button
              className={`w-1/2 py-3 font-semibold ${
                mode === "drive" ? "bg-purple-600 text-white" : ""
              }`}
              onClick={() => setMode("drive")}
            >
              🔗 Google Drive Link
            </button>
          </div>

          {/* Manual Mode */}
          {mode === "manual" && (
            <div className="mt-6">
              <label className="font-semibold">Note Content (Markdown)</label>
              <textarea
                className="w-full p-4 border rounded-xl bg-gray-50 h-64 mt-2"
                placeholder="Paste raw notes here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>

              <button
                onClick={() => setContent(formatOfflineNotes(content))}
                className="mt-3 bg-green-600 text-white px-6 py-2 rounded-xl shadow hover:bg-green-700 flex items-center gap-2"
              >
                <Check size={18} /> Auto-Format (Offline)
              </button>
            </div>
          )}

          {/* Drive Mode */}
          {mode === "drive" && (
            <div className="mt-6">
              <label className="font-semibold">Google Drive Link</label>
              <input
                className="w-full p-3 border rounded-xl bg-gray-50 mt-2"
                placeholder="https://drive.google.com/..."
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={saveNote}
            disabled={submitting}
            className="w-full mt-10 bg-purple-600 text-white py-4 rounded-xl text-lg font-bold shadow-lg hover:bg-purple-700"
          >
            {submitting ? "Saving..." : "Add Note to Library"}
          </button>
        </div>
      </div>
    </div>
  );
}
