// src/app/a2gadmin/blog/create/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import TurndownService from "turndown";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "@/styles/md-preview.css";

import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("bash", bash);


const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function YouTubeEmbed({ id }: { id: string }) {
  return (
    <div className="my-6 w-full aspect-video rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${id}`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}

function PDFViewer({ url }: { url: string }) {
  return (
    <div className="my-6 border rounded-xl overflow-hidden">
      <iframe src={url} className="w-full h-96" />
    </div>
  );
}

function DriveEmbed({ url }: { url: string }) {
  return (
    <div className="my-6 border rounded-xl overflow-hidden">
      <iframe src={url} className="w-full h-96" />
    </div>
  );
}

const previewComponents = {
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline ? (
      <SyntaxHighlighter
        style={atomOneDark}
        language={match ? match[1] : "text"}
        PreTag="div"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code className="bg-gray-800 text-gray-200 px-1 rounded" {...props}>
        {children}
      </code>
    );
  },
  p({ children }: any) {
    const child = children?.[0];
    if (typeof child === "string") {
      if (child.startsWith("@youtube(")) {
        const url = child.replace("@youtube(", "").replace(")", "");
        const idMatch = url.match(/v=([^&]+)/) || url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
        const id = idMatch ? idMatch[1] : null;
        return id ? <YouTubeEmbed id={id} /> : null;
      }
      if (child.startsWith("@pdf(")) {
        const url = child.replace("@pdf(", "").replace(")", "");
        return <PDFViewer url={url} />;
      }
      if (child.startsWith("@drive(")) {
        const url = child.replace("@drive(", "").replace(")", "");
        return <DriveEmbed url={url} />;
      }
    }
    return <p>{children}</p>;
  },
};


function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

/* --- Deterministic auto-format (non-AI) --- */
function autoFormatMarkdown(input: string) {
  let s = input || "";
  s = s.replace(/\r\n/g, "\n");

  // Convert bold-only lines to headings: **Heading** -> ## Heading
  s = s.replace(/^\s*\*\*(.+?)\*\*\s*$/gm, (_m, g1) => `## ${g1.trim()}`);

  // Convert lines like "SECTION TITLE:" to heading
  s = s.replace(/^\s*([A-Z0-9][A-Za-z0-9\s\-\u00A0]{3,})\s*:\s*$/gm, (_m, g1) => `## ${g1.trim()}`);

  // Normalize multiple blank lines
  s = s.replace(/\n{3,}/g, "\n\n");

  // Normalize list markers from * or • to -
  s = s.replace(/^\s*[\*\u2022]\s+/gm, "- ");

  // Trim trailing whitespace
  s = s.split("\n").map((l) => l.replace(/\s+$/g, "")).join("\n");

  return s;
}

/* --- HTML -> Markdown with turndown (deterministic) --- */
function htmlToMarkdown(html: string) {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  });
  return turndownService.turndown(html);
}

/* --- Helpers --- */
function hasH2Heading(markdown: string) {
  // require at least one H2 (## ) anywhere
  return /(^|\n)##\s+/.test(markdown);
}

function readingTimeMinutes(text = "") {
  const words = text.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length || 0;
  const wpm = 220;
  return Math.max(1, Math.round(words / wpm));
}

/* ---------------------- Component ---------------------- */
export default function CreateBlogPage() {
  const router = useRouter();
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

  useEffect(() => {
    // Auto-generate slug if user hasn't modified it manually
    if (!slug) setSlug(slugify(title));
  }, [title]);

  // Paste handler — when rich HTML is in clipboard convert to Markdown and insert
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const html = e.clipboardData.getData("text/html");
      if (html && html.trim() !== "") {
        e.preventDefault();
        const md = htmlToMarkdown(html);
        // append at end of content (keeps MDEditor integration simple)
        setContent((prev) => (prev ? prev + "\n\n" + md : md));
        setMsg("HTML pasted and converted to Markdown. Click Auto-format to normalize.");
      }
      // if plain text only, let the editor handle default behavior
    }

    const el = mdEditorRef.current;
    if (el) el.addEventListener("paste", onPaste as EventListener);
    return () => {
      if (el) el.removeEventListener("paste", onPaste as EventListener);
    };
  }, [mdEditorRef.current]);

  function runAutoFormat() {
    const formatted = autoFormatMarkdown(content);
    setContent(formatted);
    setMsg("Auto-format applied (non-AI). Please review before saving.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErrors([]);

    // Validation rules (per your choices)
    const errs: string[] = [];
    if (!title.trim()) errs.push("Title is required.");
    if (!slug.trim()) errs.push("Slug is required.");
    if (!summary.trim()) errs.push("Short Summary / Meta Description is required (manual).");
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
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        author: "A2G Admin",
        isPublished: true,
        readingTimeMinutes: readingTimeMinutes(content),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "posts"), payload);
      setMsg("Post created successfully!");
      router.push(`/a2gadmin/blog/edit/${docRef.id}`);

    } catch (err) {
      setMsg("A network or server error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-white max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-4 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Blog Manager
      </button>

      <h1 className="text-2xl font-semibold mb-6">Create New Blog Post</h1>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-600/10 border border-red-600/20 rounded text-sm text-red-700">
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
          <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short Summary / Meta Description" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g., GPAT)" />
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma-separated, e.g., pharma, tips)" />
          </div>
          <Input value={banner} onChange={(e) => setBanner(e.target.value)} placeholder="Banner Image URL" />
        </div>

        <div className="p-6 bg-white/10 rounded-lg border border-white/20">
          <h2 className="text-lg font-semibold mb-2">Content (Markdown)</h2>
          <div className="flex items-center justify-end mb-2">
            <Button type="button" onClick={() => runAutoFormat()} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              Auto-format (non-AI)
            </Button>
          </div>
          <div ref={mdEditorRef as any} className="bg-white/5 p-2 rounded" data-color-mode="dark">
            <MDEditor 
              value={content} 
              onChange={(v = "") => setContent(String(v))} 
              height={500} 
              previewOptions={{
                components: previewComponents,
                rehypePlugins: [rehypeRaw, rehypeSanitize]
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <Button type="submit" disabled={loading} size="lg" className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {loading ? "Saving..." : "Create Post"}
          </Button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
