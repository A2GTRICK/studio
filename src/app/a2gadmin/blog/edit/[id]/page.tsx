
// src/app/a2gadmin/blog/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Save, Trash2, Eye } from "lucide-react";
import Link from "next/link";

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

type Post = {
    title: string;
    slug: string;
    summary: string;
    category: string;
    tags: string;
    banner: string;
    content: string;
    isPublished: boolean;
};

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<Post>({ 
    title: "", slug: "", summary: "", category: "", tags: "", banner: "", content: "", isPublished: true 
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    async function loadPost() {
      setLoading(true);
      try {
        const res = await fetch(`/api/a2gadmin/blog?id=${id}`);
        const data = await res.json();
        if (res.ok && data.post) {
          setPost({
              ...data.post,
              tags: Array.isArray(data.post.tags) ? data.post.tags.join(', ') : '',
          });
        } else {
          setMsg(data.error || "Failed to load post.");
        }
      } catch (err) {
        setMsg("Network error.");
      }
      setLoading(false);
    }
    loadPost();
  }, [id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setPost(p => ({ ...p, title: newTitle, slug: slugify(newTitle)}));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    
    if (!post.title || !post.slug || !post.content) {
      setMsg("Title, Slug, and Content are required.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...post,
        tags: post.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/a2gadmin/blog?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setMsg(data.error || "Failed to update post.");
      } else {
        setMsg("Post updated successfully!");
      }
    } catch (err: any) {
      setMsg("A network or server error occurred.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) {
        return;
    }
    setSaving(true);
    try {
        const res = await fetch(`/api/a2gadmin/blog?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            alert("Post deleted.");
            router.push('/a2gadmin/blog');
        } else {
            const data = await res.json();
            alert(`Failed to delete: ${data.error}`);
        }
    } catch (err) {
        alert("Deletion failed due to a network error.");
    }
    setSaving(false);
  }

  if (loading) return <div className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="text-white max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Blog Manager
        </button>
        <div className="flex gap-2">
            <Link href={`/blog/${post.slug}`} target="_blank" className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-white/20 hover:bg-white/30">
                <Eye className="w-4 h-4" /> Preview
            </Link>
             <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Edit Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-white/10 rounded-lg border border-white/20 space-y-4">
          <Input value={post.title} onChange={handleTitleChange} placeholder="* Post Title" required />
          <Input value={post.slug} onChange={(e) => setPost(p => ({ ...p, slug: e.target.value }))} placeholder="* URL Slug" required />
          <Textarea value={post.summary} onChange={(e) => setPost(p => ({ ...p, summary: e.target.value }))} placeholder="Short Summary / Meta Description" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={post.category} onChange={(e) => setPost(p => ({ ...p, category: e.target.value }))} placeholder="Category" />
            <Input value={post.tags} onChange={(e) => setPost(p => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma-separated)" />
          </div>
          <Input value={post.banner} onChange={(e) => setPost(p => ({ ...p, banner: e.target.value }))} placeholder="Banner Image URL" />
           <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input type="checkbox" checked={post.isPublished} onChange={(e) => setPost(p => ({ ...p, isPublished: e.target.checked }))} /> Published
          </label>
        </div>
        
        <div className="p-6 bg-white/10 rounded-lg border border-white/20">
          <h2 className="text-lg font-semibold mb-2">Content (Markdown)</h2>
          <div className="bg-white/5 p-2 rounded">
            <MDEditor value={post.content} onChange={(v = "") => setPost(p => ({ ...p, content: v }))} height={500} />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <Button type="submit" disabled={saving} size="lg" className="bg-green-600 hover:bg-green-700">
            {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
