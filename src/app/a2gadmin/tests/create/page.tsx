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
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [duration, setDuration] = useState(60);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !subject.trim()) {
      setError("Title and Subject are required.");
      return;
    }

    if (duration < 10) {
      setError("Duration must be at least 10 minutes.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, "test_series"), {
        // Core
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        instructions: instructions.trim(),

        // CBT Config
        duration: Number(duration),
        marksPerQuestion: Number(marksPerQuestion),
        negativeMarks: Number(negativeMarks),

        // System
        isPublished: false,
        questionCount: 0,
        
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

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
        <Link
          href="/a2gadmin/tests"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Test Manager
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Create New Mock Test</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreateTest}
        className="space-y-4 p-6 border rounded-lg bg-card"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">Test Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., GPAT Mock Test – Pharmacology"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Pharmacology"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of this mock test."
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Instructions (shown before test starts)
          </label>
          <Textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="• Each question carries equal marks\n• No calculator allowed\n• Negative marking applies"
            rows={4}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Duration (minutes)
          </label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={10}
            required
          />
        </div>

        {/* Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Marks per Question
            </label>
            <Input
              type="number"
              value={marksPerQuestion}
              onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
              min={1}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Negative Marks
            </label>
            <Input
              type="number"
              value={negativeMarks}
              onChange={(e) => setNegativeMarks(Number(e.target.value))}
              min={0}
              step="0.25"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={loading}>
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {loading ? "Creating..." : "Create Test & Add Questions"}
          </Button>
        </div>
      </form>
    </div>
  );
}
