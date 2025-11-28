
"use client";
import { useState } from "react";

export default function AINotesGenerator() {
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");

    const res = await fetch("/api/gen/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course, subject, topic })
    });

    const data = await res.json();
    setOutput(data.notes || "Error generating notes.");
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-4">

      <h1 className="text-2xl font-bold">AI Notes Generator</h1>
      <p className="text-gray-600">Generate detailed notes instantly for any pharmacy subject.</p>

      {/* Form */}
      <form onSubmit={handleGenerate} className="grid gap-4 max-w-xl">

        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="p-3 border rounded"
        >
          <option value="">Select Course</option>
          <option value="D.Pharm">D.Pharm</option>
          <option value="B.Pharm">B.Pharm</option>
        </select>

        <input
          type="text"
          placeholder="Subject (e.g., Pharmacognosy)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="p-3 border rounded"
        />

        <input
          type="text"
          placeholder="Topic (e.g., Glycosides)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="p-3 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Generating..." : "Generate Notes"}
        </button>
      </form>

      {/* Output */}
      {output && (
        <div className="p-4 bg-white border rounded mt-6 whitespace-pre-wrap">
          <h2 className="text-xl font-bold mb-2">Generated Notes</h2>
          <p>{output}</p>
        </div>
      )}

    </div>
  );
}
