
// src/app/a2gadmin/blog/create/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
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
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(slugify(newTitle));
  };
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    if (!title || !slug || !content) {
      setMsg("Title, Slug, and Content are required.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title, slug, summary, category, banner, content,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        author: "A2G Admin", // Or dynamically get from auth
        isPublished: true, // Default to published
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
    } catch (err: any) {
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-white/10 rounded-lg border border-white/20 space-y-4">
          <Input value={title} onChange={handleTitleChange} placeholder="* Post Title" required />
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
          <div className="bg-white/5 p-2 rounded">
            <MDEditor value={content} onChange={(v = "") => setContent(v)} height={500} />
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
