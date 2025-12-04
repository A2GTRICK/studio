"use client";
import { useState } from "react";
import { createTest, bulkUploadQuestions } from "@/services/practice";
import BulkUpload from "@/components/a2gadmin/BulkUpload";

export default function CreateTestPage() {
  const [title, setTitle] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkUploadMsg, setBulkUploadMsg] = useState("");

  async function onSave() {
    if (!title) {
      alert("Please enter a title for the test.");
      return;
    }
    setLoading(true);
    const res = await createTest({ title });
    setLoading(false);
    if (res?.error) {
      alert(res.error || "Error creating test");
      return;
    }
    if (res?.id) {
      setCreatedId(res.id);
    }
  }

  async function handleBulkUpload(questions: any[]) {
    if (!createdId) return;
    setBulkUploadMsg("Uploading...");
    
    const sections = [{
        title: 'Main Section',
        questions: questions.map(q => ({
            text: q.question,
            type: 'single',
            options: [q.optionA, q.optionB, q.optionC, q.optionD].map(opt => ({ text: opt })),
            answer: q.answer, // Assuming answer is 'A', 'B', etc. corresponding to index. Adjust if needed.
        }))
    }];

    const res = await bulkUploadQuestions(createdId, sections);
    if (res?.error) {
        setBulkUploadMsg("Error: " + res.error);
    } else {
        setBulkUploadMsg("Questions uploaded successfully!");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Test</h1>
      <div className="p-4 rounded mb-4 text-black bg-white/80">
        <label className="block text-sm mb-1 font-semibold">Test Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
        <div className="mt-3">
          <button onClick={onSave} disabled={loading || !!createdId} className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400">
            {loading ? "Saving…" : "1. Save Test"}
          </button>
        </div>
      </div>

      {createdId && (
        <div className="p-4 rounded text-black bg-white/80">
          <h3 className="font-semibold mb-2 text-lg">2. Bulk Upload Questions for '{title}'</h3>
          <BulkUpload onUpload={handleBulkUpload} />
          {bulkUploadMsg && <p className="mt-2 text-sm text-gray-600">{bulkUploadMsg}</p>}
        </div>
      )}
    </div>
  );
}
