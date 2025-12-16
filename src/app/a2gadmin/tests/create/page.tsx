
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function CreateTestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      setError("Title and Subject are required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, "test_series"), {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        duration: Number(duration),
        isPublished: false,
        questionCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      // Redirect to the new test's edit page
      router.push(`/a2gadmin/tests/edit/${docRef.id}`);
    } catch (err) {
      console.error("Error creating test:", err);
      setError("Failed to create the test. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/a2gadmin/tests" className="text-sm text-primary hover:underline">
          &larr; Back to Test Manager
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Create New Mock Test</h1>
      
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateTest} className="space-y-4 p-6 border rounded-lg bg-card">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Test Title</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., GPAT Mock Test #1"
            required
          />
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Pharmacology"
            required
          />
        </div>
        <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optional)</label>
            <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief summary of what this test covers."
            />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-1">Duration (in minutes)</label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            required
            min="10"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating..." : "Create Test & Add Questions"}
          </Button>
        </div>
      </form>
    </div>
  );
}
