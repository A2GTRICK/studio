"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Loader2, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/config";

interface Post {
  id: string;
  title: string;
  slug: string;
  category?: string;
  isPublished: boolean;
  updatedAt?: any;
}

export default function BlogAdminPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");

  async function loadPosts() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setPosts(
        snap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Post)
        )
      );
    } catch (e) {
      console.error("Failed to load posts", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (status === "published" && !p.isPublished) return false;
      if (status === "draft" && p.isPublished) return false;
      return true;
    });
  }, [posts, search, status]);

  async function handleDelete(post: Post) {
    const ok = confirm(
      `Delete "${post.title}"?\n\nThis action is permanent and cannot be undone.`
    );
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "posts", post.id));
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      alert("Post deleted successfully.");
    } catch (e) {
      alert("Delete failed. Please try again.");
    }
  }

  const formatDate = (ts?: any) => {
    if (!ts) return "—";
    const d = ts.seconds
      ? new Date(ts.seconds * 1000)
      : new Date(ts);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("en-IN");
  };

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Blog Manager</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, publish, and manage articles.
          </p>
        </div>

        <Link
          href="/a2gadmin/blog/create"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow hover:bg-primary/90"
        >
          <PlusCircle className="w-5 h-5" />
          Write New Post
        </Link>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 bg-secondary/50 p-4 rounded-xl border">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 p-2 rounded-lg border bg-card"
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="p-2 rounded-lg border bg-card"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as any)
          }
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 hidden md:table-cell">Category</th>
              <th className="p-4 hidden sm:table-cell">Status</th>
              <th className="p-4 hidden md:table-cell">Updated</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-muted-foreground"
                >
                  No posts found.
                </td>
              </tr>
            ) : (
              filtered.map((post) => (
                <tr
                  key={post.id}
                  className="border-b last:border-b-0"
                >
                  <td className="p-4 font-medium">
                    {post.title}
                  </td>
                  <td className="p-4 hidden md:table-cell text-muted-foreground">
                    {post.category || "—"}
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.isPublished
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {post.isPublished
                        ? "Published"
                        : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                    {formatDate(post.updatedAt)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/a2gadmin/blog/edit/${post.id}`}
                        className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Edit
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(post)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
