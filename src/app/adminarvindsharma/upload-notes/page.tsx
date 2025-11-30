
'use client';

import { useState } from "react";
import Link from 'next/link';
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Loader2, ArrowLeft } from "lucide-react";

export default function UploadNotesAdmin() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [mode, setMode] = useState("manual"); // manual | drive
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 OFFLINE AUTO-FORMATTER (professional notes format)
  function autoFormat(raw: string): string {
    if (!raw.trim()) return "";

    let lines = raw.split("\n").map(line => line.trim());

    // Headings: convert raw start words into clean professional headings
    lines = lines.map(line => {
      if (line.startsWith("##")) return `### ${line.replace(/#/g, "").trim()}`;
      if (line.startsWith("#")) return `## ${line.replace(/#/g, "").trim()}`;
      return line;
    });

    // Bullet points auto-detect
    lines = lines.map(line => {
      if (/^\d+\./.test(line)) return line; // numbered list
      if (/[-•▪]/.test(line.charAt(0))) return `- ${line.slice(1).trim()}`;
      return line;
    });

    return lines.join("\n");
  }

  // 🔥 Firestore Submit Handler
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formatted = autoFormat(content);

      const docData = {
        title,
        subject,
        course,
        year,
        thumbnail,
        content: formatted,
        driveLink: mode === "drive" ? driveLink : null,
        isPremium,
        createdAt: serverTimestamp(),
        adminKey: "Arvind8826@" // 🔥 REQUIRED for Firestore rule
      };

      await addDoc(collection(db, "notes"), docData);

      alert("Note added successfully!");
      window.location.href = "/adminarvindsharma/dashboard";

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Error adding note: " + err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f2ff] p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-purple-200">
        <Link href="/adminarvindsharma/dashboard" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
        </Link>
        {/* HEADER */}
        <h1 className="text-3xl font-bold text-purple-800 mb-1">Add New Note</h1>
        <p className="text-gray-600 mb-8">Use this form to upload high-quality pharmacy notes.</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* TITLE */}
          <div>
            <label className="block font-semibold mb-1">Note Title / Topic</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Human Anatomy"
              className="w-full p-3 border rounded-xl bg-gray-50"
              required
            />
          </div>

          {/* COURSE + YEAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Course</label>
              <select
                className="w-full p-3 border rounded-xl bg-gray-50"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                required
              >
                <option value="">Select Course</option>
                <option value="D.Pharm">D.Pharm</option>
                <option value="B.Pharm">B.Pharm</option>
                <option value="M.Pharm">M.Pharm</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Year</label>
              <select
                className="w-full p-3 border rounded-xl bg-gray-50"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              >
                <option value="">Select Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="block font-semibold mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g., HAP I"
              className="w-full p-3 border rounded-xl bg-gray-50"
              required
            />
          </div>

          {/* THUMBNAIL */}
          <div>
            <label className="block font-semibold mb-1">Thumbnail Image (optional)</label>
            <input
              value={thumbnail}
              onChange={e => setThumbnail(e.target.value)}
              placeholder="https://your-image.jpg"
              className="w-full p-3 border rounded-xl bg-gray-50"
            />
          </div>

          {/* PREMIUM */}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
            Mark as Premium
          </label>

          {/* MODE SWITCH */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`px-4 py-2 rounded-lg w-1/2 ${mode === "manual" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
            >
              ✍ Manual Entry
            </button>

            <button
              type="button"
              onClick={() => setMode("drive")}
              className={`px-4 py-2 rounded-lg w-1/2 ${mode === "drive" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
            >
              🔗 Google Drive Link
            </button>
          </div>

          {/* MANUAL ENTRY MODE */}
          {mode === "manual" && (
            <div>
              <label className="block font-semibold mb-1">Note Content (Markdown Supported)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 border rounded-xl bg-gray-50"
                rows={10}
                placeholder="Start writing your notes here..."
              />
            </div>
          )}

          {/* DRIVE LINK MODE */}
          {mode === "drive" && (
            <div>
              <label className="block font-semibold mb-1">Google Drive Link</label>
              <input
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full p-3 border rounded-xl bg-gray-50"
              />
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white text-lg font-semibold bg-purple-600 hover:bg-purple-700 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> Saving...
              </span>
            ) : (
              "Add Note to Library"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
