// src/app/a2gadmin/blog/create/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import TurndownService from "turndown";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Save } from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

/* Deterministic non-AI auto-format:
   - Convert lines like "**Heading**" or "HEADING:" to "## Heading"
   - Normalize multiple blank lines
   - Ensure lists use "-" bullet style
   - Convert ordered list numbering if malformed
   - Do NOT rewrite content meaningfully
*/
function autoFormatMarkdown(input: string) {
  let s = input;

  // 1) Replace Windows CRLF with LF
  s = s.replace(/\r\n/g, "\n");

  // 2) Convert bold-only lines to headings:
  //    e.g. "**Section Title**" or "<strong>Section</strong>" will turn to "## Section"
  s = s.replace(/^\s*\*\*(.+?)\*\*\s*$/gm, (_m, g1) => `## ${g1.trim()}`);

  // 3) Convert lines like "SECTION TITLE:" or "Section Title -" into heading
  s = s.replace(/^\s*([A-Z0-9][A-Za-z0-9\s\-\u00A0]{3,})\s*:\s*$/gm, (_m, g1) => `## ${g1.trim()}`);

  // 4) Normalize multiple blank lines to at most 2
  s = s.replace(/\n{3,}/g, "\n\n");

  // 5) Normalize unordered list markers to "-" (convert leading "*" or "•")
  s = s.replace(/^\s*[\*\u2022]\s+/gm, "- ");

  // 6) Ensure ordered lists remain "1." pattern; fix stray numbering
  s = s.replace(/^\s*\d+[\.\)]\s+/gm, (m) => {
    // keep numeric form as-is (safe)
    return m;
  });

  // 7) Trim trailing whitespace on lines
  s = s.split("\n").map((l) => l.replace(/\s+$/g, "")).join("\n");

  return s;
}

/* Very small HTML-to-Markdown conversion using Turndown (deterministic)
   Called on paste events when HTML is present in clipboard
*/
function htmlToMarkdown(html: string) {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });

  // Keep basic formatting, tables, lists etc.
  const md = turndownService.turndown(html);
  return md;
}

/* utility: checks presence of at least one H2 ("## ") in markdown */
function hasH2Heading(markdown: string) {
  return /\n##\s+/.test("\n" + markdown) || /^\s*##\s+/m.test(markdown);
}

/* simple reading time */
function readingTime(text = "") {
  const words = text.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length || 0;
  const wpm = 220;
  const minutes = Math.max(1, Math.round(words / wpm));
  return minutes;
}

export default function CreateBlogPage() {
  const router = useRouter();

  // form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [banner, setBanner] = useState("");
  const [content, setContent] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const mdEditorRef = useRef<HTMLDivElement | null>(null);

  // update slug when title changes
  useEffect(() => {
    if (!slug || slug === "") {
      setSlug(slugify(title));
    }
  }, [title, slug]);

  // Paste handler: capture HTML clipboard and convert to Markdown
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const html = e.clipboardData.getData("text/html");
      const plain = e.clipboardData.getData("text/plain");

      // Only act if HTML content is present (pasted from docs/sites)
      if (html && html.trim() !== "") {
        e.preventDefault();
        const md = htmlToMarkdown(html);
        // Insert at cursor location by appending to content (simple append)
        // For better UX, a proper selection-based insertion can be added later.
        setContent((prev) => (prev ? prev + "\n\n" + md : md));
      } else if (plain) {
        // let plain text default paste occur inside MDEditor; we append
        // We'll not override plain paste; editor handles it.
      }
    }

    // Attach to md editor container
    const el = mdEditorRef.current;
    if (el) {
      el.addEventListener("paste", onPaste as EventListener);
    }
    return () => {
      if (el) el.removeEventListener("paste", onPaste as EventListener);
    };
  }, []);

  function runAutoFormat() {
    // Non-AI deterministic auto-format
    const formatted = autoFormatMarkdown(content);
    setContent(formatted);
    setMsg("Auto-format applied (non-AI). Please review before saving.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErrors([]);

    // Basic validation
    const errs: string[] = [];
    if (!title.trim()) errs.push("Title is required.");
    if (!slug.trim()) errs.push("Slug is required.");
    if (!summary.trim()) errs.push("Short summary / meta description is required (manual).");
    if (!content.trim()) errs.push("Content is required.");
    if (!hasH2Heading(content)) errs.push("Content must contain at least one H2 heading (## Heading) for TOC support.");

    if (errs.length > 0) {
      setErrors(errs);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        slug: slugify(slug.trim()),
        summary: summary.trim(),
        category: category.trim(),
        banner: banner.trim() || null,
        content: content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        author: "A2G Admin",
        isPublished: true,
        readingTimeMinutes: readingTime(content),
      };

      const res = await fetch("/api/a2gadmin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed to create post.");
      } else {
        setMsg("Post created successfully!");
        router.push(`/a2gadmin/blog/edit/${data.id}`);
      }
    } catch (err) {
      setMsg("A network or server error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-4 hover:underline text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Blog Manager
      </button>

      <h1 className="text-2xl font-semibold mb-6 text-white">Create New Blog Post</h1>

      {/* show errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-600/10 border border-red-600/20 rounded text-sm text-red-300">
          <div className="font-medium mb-2">Please fix the following:</div>
          <ul className="list-disc pl-5">
            {errors.map((er, i) => (
              <li key={i}>{er}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-white/10 rounded-lg border border-white/20 space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="* Post Title" required />
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="* URL Slug (auto-generated)" required />
          <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short Summary / Meta Description (required)" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g., GPAT)" />
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated, e.g., pharma, tips)" />
          </div>
          <Input value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="Banner Image URL (optional)" />
        </div>

        <div className="p-6 bg-white/10 rounded-lg border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Content (Markdown)</h2>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={() => runAutoFormat()} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Auto-format (non-AI)
              </Button>
            </div>
          </div>

          <div ref={mdEditorRef as any} className="bg-white/5 p-2 rounded">
            <MDEditor value={content} onChange={(v = "") => setContent(String(v))} height={520} />
          </div>

          <div className="mt-3 text-sm text-gray-400">
            Tip: You can paste from Google Docs — the editor will auto-convert HTML to Markdown. After paste click <strong>Auto-format</strong> to normalize headings & lists.
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <Button type="submit" disabled={loading} size="lg" className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {loading ? "Saving..." : "Create Post"}
          </Button>
          {msg && <span className="text-sm text-white">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
