'use client';

import React, { useState, useEffect, useMemo } from "react";
import { db, storage } from "@/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from "firebase/storage";

/**
 * Admin Upload Notes Page
 * Schema B (meta + content with markdown + html + aiCleanedVersion)
 *
 * NOTE: This component reads adminConfig/main to get adminCode (as your security rules require).
 * Then it uploads attachments to Storage, then writes the note doc with adminKey == adminCode
 */

function formatBytes(bytes: number) {
  if (!bytes) return "";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
}

/** Simple Markdown -> HTML converter for headings, bold, lists, links, paragraphs.
 *  Not full-featured; covers typical academic formatting needs.
 */
function basicMarkdownToHtml(md: string) {
  if (!md) return "";

  // Escape HTML
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>");
  html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold **text**
  html = html.replace(/\*\*(.+?)\*\*/gim, "<strong>$1</strong>");
  // Italic *text*
  html = html.replace(/\*(.+?)\*/gim, "<em>$1</em>");

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

  // Unordered lists - convert lines starting with - or * or 🔹
  html = html.replace(/^(?:[-\*\uD83D\uDD39]\s+)(.+)$/gim, "<li>$1</li>");
  // Wrap li blocks into ul (simple grouping)
  html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, (match) => {
    // If multiple li contiguous, wrap them
    return `<ul>${match.replace(/<\/li>\s*<li>/g, "</li><li>")}</ul>`;
  });

  // Ordered lists: lines starting with 1. 2. etc.
  html = html.replace(/^\s*\d+\.\s+(.+)$/gim, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, (match) => {
    if (/^\s*\d+\./m.test(match)) {
      return `<ol>${match.replace(/<\/li>\s*<li>/g, "</li><li>")}</ol>`;
    }
    return match;
  });

  // Paragraphs: any leftover non-tag lines -> <p>
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      // If block contains a block-level tag already, keep as-is
      if (/<\/?(h\d|ul|ol|li|pre|blockquote|p|table|img|div)/i.test(block.trim())) {
        return block;
      }
      // Otherwise wrap lines in <p> preserving single-line breaks as <br/>
      const trimmed = block.trim();
      if (!trimmed) return "";
      return `<p>${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  // Clean up possible nested <ul><li><ul> duplicates introduced by naive rules
  html = html.replace(/<\/ul>\s*<ul>/g, "").replace(/<\/ol>\s*<ol>/g, "");

  return html;
}

/** Basic offline auto-format: remove repeated headers, normalize spacing. */
function offlineAutoFormat(md: string) {
  if (!md) return "";
  // Replace weird long sequences of repeated '#' styles with standardized spacing
  let s = md.replace(/\r\n/g, "\n");
  // Normalize multiple blank lines
  s = s.replace(/\n{3,}/g, "\n\n");
  // Ensure a blank line after headings
  s = s.replace(/^(#+\s*.+)$/gm, "$1\n");
  // Normalize bullet markers: replace '🔹' -> '-'
  s = s.replace(/🔹/g, "-");
  // Trim excessive spaces on each line
  s = s.split("\n").map((l) => l.trimEnd()).join("\n");
  // Remove duplicate headings sequentially
  s = s.replace(/(#+\s*[^\n]+)\n\1/g, "$1");

  return s.trim();
}

/* ---------- Component ---------- */
export default function AdminUploadNotesPage() {
  // Form fields
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  // content
  const [markdown, setMarkdown] = useState("");
  const [aiCleaned, setAiCleaned] = useState(""); // left empty unless AI returns
  const [htmlRendered, setHtmlRendered] = useState("");

  // attachments
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // adminCode read from adminConfig/main
  const [adminCode, setAdminCode] = useState<string | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // fetch admin code (allowed by your rules: adminConfig read: if true)
  useEffect(() => {
    async function loadAdminCode() {
      try {
        const docRef = doc(db, "adminConfig", "main");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as any;
          setAdminCode(data.adminCode || null);
        } else {
          setAdminCode(null);
        }
      } catch (err) {
        console.error("Failed to read adminConfig:", err);
        setMessage({ type: "error", text: "Could not read admin configuration." });
      }
    }
    loadAdminCode();
  }, []);

  // render HTML from markdown (cached)
  useEffect(() => {
    setHtmlRendered(basicMarkdownToHtml(aiCleaned || markdown));
  }, [markdown, aiCleaned]);

  // handle file selection
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setAttachments(Array.from(files));
  };

  // upload attachments client-side and return array of URLs
  const uploadAllFiles = async (noteId: string) => {
    const urls: string[] = [];
    for (const file of attachments) {
      try {
        const path = `notes/${noteId}/${Date.now()}_${file.name}`;
        const ref = storageRef(storage, path);
        const uploadTask = uploadBytesResumable(ref, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress((prev) => ({ ...prev, [file.name]: Math.round(progress) }));
            },
            (error) => {
              console.error("Upload failed:", error);
              reject(error);
            },
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              urls.push(url);
              setUploadedUrls((prev) => [...prev, url]);
              resolve();
            }
          );
        });
      } catch (err) {
        console.error("Single file upload error:", err);
        throw err;
      }
    }
    return urls;
  };

  // offline auto-format (button)
  const handleAutoFormat = () => {
    const cleaned = offlineAutoFormat(markdown);
    setMarkdown(cleaned);
    setMessage({ type: "success", text: "Offline formatting applied." });
    // also set HTML preview
    setHtmlRendered(basicMarkdownToHtml(cleaned));
  };

  // AI refine (calls your /api/refine route). Gracefully fallback to offline formatting on failure.
  const handleAIRefine = async () => {
    if (!markdown.trim()) {
      setMessage({ type: "error", text: "Add content first to refine." });
      return;
    }
    setMessage({ type: "info", text: "Calling AI refine..." });

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: markdown })
      });

      const data = await res.json();

      if (!res.ok || !data?.refined) {
        throw new Error(data?.error || "No refined content returned.");
      }
      setAiCleaned(data.refined);
      setMarkdown((prev) => data.refined); // replace current with refined version
      setMessage({ type: "success", text: "AI refinement applied." });
    } catch (err: any) {
      console.warn("AI refine failed, fallback to offline:", err);
      // fallback
      const cleaned = offlineAutoFormat(markdown);
      setAiCleaned("");
      setMarkdown(cleaned);
      setMessage({ type: "info", text: "AI refine failed — offline format applied." });
    }
  };

  // Save note -> 1) upload files, 2) add doc to Firestore
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !subject.trim() || !course.trim() || !year.trim() || !markdown.trim()) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }
    if (!adminCode) {
      setMessage({ type: "error", text: "Admin configuration missing (unable to save)." });
      return;
    }

    setSaving(true);
    setMessage({ type: "info", text: "Uploading attachments (if any)..." });

    try {
      // create a temporary doc id to use for storage path
      const tempDocRef = doc(collection(db, "notes"));
      const noteId = tempDocRef.id;

      // upload files
      const fileUrls = attachments.length ? await uploadAllFiles(noteId) : [];

      // prepare doc following Schema B
      const docData = {
        meta: {
          title: title.trim(),
          course: course.trim(),
          year: year.trim(),
          subject: subject.trim(),
          thumbnail: thumbnailUrl || (fileUrls[0] || ""), // prefer explicit thumbnail or first file
          isPremium: Boolean(isPremium),
          createdAt: serverTimestamp()
        },
        content: {
          markdown: markdown,
          htmlFormatted: basicMarkdownToHtml(aiCleaned || markdown),
          aiCleanedVersion: aiCleaned || ""
        },
        attachments: fileUrls,
        adminKey: adminCode // required by your Firestore rules for create
      };

      // add doc (create)
      await addDoc(collection(db, "notes"), docData);

      setMessage({ type: "success", text: "Note saved successfully." });
      // reset form
      setTitle("");
      setCourse("");
      setYear("");
      setSubject("");
      setMarkdown("");
      setAttachments([]);
      setUploadedUrls([]);
      setUploadProgress({});
      setAiCleaned("");
      // small delay then redirect back to admin dashboard
      setTimeout(() => {
        window.location.href = "/adminarvindsharma/dashboard";
      }, 900);
    } catch (err: any) {
      console.error("Save note error:", err);
      setMessage({ type: "error", text: "Failed to save note. Check console." });
    } finally {
      setSaving(false);
    }
  };

  // quick preview rendered HTML
  const Preview = useMemo(() => {
    return (
      <div style={{ maxHeight: "75vh", overflowY: "auto", padding: 20 }} dangerouslySetInnerHTML={{ __html: htmlRendered }} />
    );
  }, [htmlRendered]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Upload Note <span style={{ color: "#6B21A8" }}>📄</span></h1>
            <p className="text-gray-600 mt-1">Add a new study note to the library (manual text or Google Drive link). Supports Markdown and attachments.</p>
          </div>
          <div>
            <button onClick={() => (window.location.href = "/adminarvindsharma/dashboard")} className="px-4 py-2 border rounded-lg bg-white shadow">← Back to Dashboard</button>
          </div>
        </div>

        {/* message */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${message.type === "success" ? "bg-green-50 border border-green-200" : message.type === "error" ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}>
            <div style={{ color: message.type === "success" ? "#065f46" : message.type === "error" ? "#7f1d1d" : "#0f172a" }}>{message.text}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow p-6 border border-purple-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Note Title</label>
              <input className="w-full p-3 border rounded-lg bg-gray-50" placeholder="e.g., Human Anatomy - Blood" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Subject</label>
              <input className="w-full p-3 border rounded-lg bg-gray-50" placeholder="e.g., Human Anatomy and Physiology" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Course</label>
              <input className="w-full p-3 border rounded-lg bg-gray-50" placeholder="e.g., B.Pharm" value={course} onChange={(e) => setCourse(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Year</label>
              <input className="w-full p-3 border rounded-lg bg-gray-50" placeholder="e.g., 2nd Year" value={year} onChange={(e) => setYear(e.target.value)} required />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">Thumbnail Image URL (optional)</label>
            <input className="w-full p-3 border rounded-lg bg-gray-50" placeholder="https://..." value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">Content (Markdown supported)</label>
            <textarea rows={10} value={markdown} onChange={(e) => setMarkdown(e.target.value)} className="w-full p-4 border rounded-lg bg-gray-50" placeholder="Start writing your notes here... (supports Markdown)" required />
            <div className="flex gap-2 justify-end mt-3">
              <button type="button" onClick={handleAutoFormat} className="px-4 py-2 bg-white border rounded-lg">Auto-Format Offline</button>
              <button type="button" onClick={handleAIRefine} className="px-4 py-2 bg-purple-600 text-white rounded-lg">{/* AI refine */}✨ Refine (AI)</button>
              <button type="button" onClick={() => { setPreviewOpen(true); }} className="px-4 py-2 bg-gray-100 border rounded-lg">Preview</button>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <label className="block text-sm font-semibold mb-2">Attachments (PDF, JPEG, PNG, DOCX) — Upload optional</label>
            <input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
            {attachments.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Selected files:</p>
                <ul className="space-y-2">
                  {attachments.map((f) => (
                    <li key={f.name} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                      <div>
                        <strong>{f.name}</strong>
                        <div className="text-xs text-gray-600">{formatBytes(f.size)}</div>
                      </div>
                      <div className="text-sm">
                        {uploadProgress[f.name] ? <span>{uploadProgress[f.name]}%</span> : <span>Ready</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
              <span className="text-sm">Mark as Premium Content</span>
            </label>
          </div>

          <div className="mt-6">
            <button disabled={saving} type="submit" className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold">
              {saving ? "Saving..." : "Add Note to Library"}
            </button>
          </div>
        </form>

        {/* Preview Modal */}
        {previewOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "90%", maxWidth: 900, background: "#fff", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottom: "1px solid #eee" }}>
                <div>
                  <strong style={{ fontSize: 18 }}>{title || "Preview"}</strong>
                  <div style={{ fontSize: 12, color: "#666" }}>{course} • {year} • {subject}</div>
                </div>
                <div>
                  <button onClick={() => setPreviewOpen(false)} style={{ padding: "8px 12px", borderRadius: 8 }}>Close</button>
                </div>
              </div>
              <div style={{ padding: 20 }}>
                {Preview}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
