"use client";
import { useState } from "react";
import { createTest } from "@/services/practice";
import BulkUpload from "@/components/a2gadmin/BulkUpload";

export default function CreateTestPage() {
  const [title, setTitle] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSave() {
    setLoading(true);
    const res = await createTest({ title });
    setLoading(false);
    if (res?.error) {
      alert(res.error || "Error");
      return;
    }
    if (res?.id) {
      setCreatedId(res.id);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Test</h1>
      <div className="bg-white p-4 rounded mb-4">
        <label className="block text-sm mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border p-2 rounded" />
        <div className="mt-3">
          <button onClick={onSave} disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded">
            {loading ? "Saving…" : "Save Test"}
          </button>
        </div>
      </div>

      {createdId && (
        <div className="bg-white p-4 rounded">
          <h3 className="font-semibold mb-2">Bulk Upload Questions</h3>
          <BulkUpload testId={createdId} />
        </div>
      )}
    </div>
  );
}