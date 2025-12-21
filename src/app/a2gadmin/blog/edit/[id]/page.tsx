"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .replace(/--+/g, "-");
}

export default function EditBlogPage() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, "posts", String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setMsg("Post not found.");
          return;
        }
        const data = snap.data();
        setPost({
          ...data,
          tags: Array.isArray(data.tags)
            ? data.tags.join(", ")
            : "",
        });
      } catch {
        setMsg("Failed to load post.");
      }
    }
    load();
  }, [id]);

  if (!post)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!post.title || !post.content) {
      setMsg("Title and content are required.");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "posts", String(id)), {
        ...post,
        slug: slugify(post.slug),
        tags: post.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
        updatedAt: serverTimestamp(),
      });
      setMsg("Changes saved successfully.");
    } catch {
      setMsg("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = confirm(
      "Delete this post permanently?\n\nThis cannot be undone."
    );
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "posts", String(id)));
      router.push("/a2gadmin/blog");
    } catch {
      alert("Delete failed.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* TOP BAR */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex gap-2">
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="px-3 py-1.5 rounded-md bg-secondary text-sm flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> Preview
          </Link>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <h1 className="text-2xl font-semibold">
        Edit Blog Post
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-secondary/30 p-6 rounded-lg border space-y-4">
          <Input
            value={post.title}
            onChange={(e) =>
              setPost((p: any) => ({
                ...p,
                title: e.target.value,
                slug: slugify(e.target.value),
              }))
            }
            placeholder="Post Title"
            required
          />

          <Input
            value={post.slug}
            onChange={(e) =>
              setPost((p: any) => ({
                ...p,
                slug: e.target.value,
              }))
            }
            placeholder="URL Slug"
            required
          />

          <Textarea
            value={post.summary}
            onChange={(e) =>
              setPost((p: any) => ({
                ...p,
                summary: e.target.value,
              }))
            }
            placeholder="Short summary / meta description"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              value={post.category}
              onChange={(e) =>
                setPost((p: any) => ({
                  ...p,
                  category: e.target.value,
                }))
              }
              placeholder="Category"
            />
            <Input
              value={post.tags}
              onChange={(e) =>
                setPost((p: any) => ({
                  ...p,
                  tags: e.target.value,
                }))
              }
              placeholder="Tags (comma separated)"
            />
          </div>

          <Input
            value={post.banner}
            onChange={(e) =>
              setPost((p: any) => ({
                ...p,
                banner: e.target.value,
              }))
            }
            placeholder="Banner image URL"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={post.isPublished}
              onChange={(e) =>
                setPost((p: any) => ({
                  ...p,
                  isPublished: e.target.checked,
                }))
              }
            />
            Published
          </label>
        </div>

        <div className="bg-secondary/30 p-6 rounded-lg border">
          <h2 className="font-semibold mb-2">
            Content (Markdown)
          </h2>
          <div data-color-mode="dark">
            <MDEditor
              value={post.content}
              onChange={(v = "") =>
                setPost((p: any) => ({
                  ...p,
                  content: v,
                }))
              }
              height={500}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            {saving ? (
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </Button>

          {msg && (
            <span className="text-sm text-muted-foreground">
              {msg}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
