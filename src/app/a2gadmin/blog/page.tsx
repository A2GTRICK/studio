
// src/app/a2gadmin/blog/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Loader2, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Post {
    id: string;
    title: string;
    slug: string;
    category?: string;
    isPublished: boolean;
    updatedAt: any;
}

export default function BlogAdminPage() {
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadPosts() {
      setLoading(true);
      try {
          const res = await fetch('/api/a2gadmin/blog');
          const data = await res.json();
          setAllPosts(data.posts || []);
      } catch (error) {
          console.error("Error loading posts:", error);
      }
      setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];
    if (search.trim()) {
      filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (statusFilter === "published") {
      filtered = filtered.filter(p => p.isPublished === true);
    } else if (statusFilter === "draft") {
      filtered = filtered.filter(p => p.isPublished === false);
    }
    return filtered;
  }, [allPosts, search, statusFilter]);

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post permanently?")) return;
    
    try {
        await fetch(`/api/a2gadmin/blog?id=${postId}`, { method: "DELETE" });
        setAllPosts(allPosts.filter(p => p.id !== postId));
        alert("Post deleted successfully!");
    } catch(err) {
        console.error("Delete failed", err);
        alert("Delete failed!");
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No Date';
    const dateValue = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    if (isNaN(dateValue.getTime())) return 'Invalid Date';
    return dateValue.toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-10 w-10 animate-spin text-purple-300" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Blog Manager</h1>
          <p className="text-sm text-gray-400">Create, edit, and manage all your articles.</p>
        </div>
        <Link href="/a2gadmin/blog/create" className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition">
          <PlusCircle className="w-5 h-5" />
          Write New Post
        </Link>
      </div>

       <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl border">
        <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
            <input
            type="text"
            placeholder="Search posts by title..."
            className="border p-2 rounded-lg w-full sm:w-auto flex-grow pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        <select
          className="border p-2 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-purple-50/50 border-b border-purple-200/80">
                <tr>
                    <th className="p-4 font-semibold">Title</th>
                    <th className="p-4 font-semibold hidden md:table-cell">Category</th>
                    <th className="p-4 font-semibold hidden sm:table-cell">Status</th>
                    <th className="p-4 font-semibold hidden md:table-cell">Last Updated</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredPosts.length === 0 ? (
                    <tr><td colSpan={5} className="text-center p-8 text-gray-500">No posts found.</td></tr>
                ) : (
                    filteredPosts.map(post => (
                        <tr key={post.id} className="border-b last:border-b-0 border-gray-100">
                            <td className="p-4 font-medium">{post.title}</td>
                            <td className="p-4 hidden md:table-cell">{post.category || '—'}</td>
                            <td className="p-4 hidden sm:table-cell">
                                <span className={`px-2 py-1 text-xs rounded-full ${post.isPublished ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {post.isPublished ? 'Published' : 'Draft'}
                                </span>
                            </td>
                            <td className="p-4 hidden md:table-cell text-sm text-gray-500">{formatDate(post.updatedAt)}</td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                     <Link href={`/a2gadmin/blog/edit/${post.id}`} className="px-3 py-1 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700">Edit</Link>
                                     <Button size="sm" variant="destructive" onClick={() => handleDelete(post.id)}>Delete</Button>
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
