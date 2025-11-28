"use client";
import { useState } from "react";

interface Mcq {
  question: string;
  options: string[];
}

export default function AIMCQGenerator() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [mcqs, setMcqs] = useState<Mcq[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/gen/mcq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, count }),
    });

    const data = await res.json();
    setMcqs(data.mcqs || []);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">AI MCQ Generator</h1>
      <p className="text-gray-600">Generate high-quality MCQs for any topic.</p>

      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-4 max-w-md">

        <input
          type="text"
          placeholder="Enter topic (e.g., Glycosides)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="p-3 border rounded w-full"
        />

        <select
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="p-3 border rounded w-full"
        >
          <option value="5">5 MCQs</option>
          <option value="10">10 MCQs</option>
          <option value="20">20 MCQs</option>
        </select>

        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded w-full"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate MCQs"}
        </button>
      </form>

      {/* Output */}
      {mcqs.length > 0 && (
        <div className="space-y-4 mt-6">
          <h2 className="text-xl font-bold">Generated MCQs</h2>

          {mcqs.map((mcq, index) => (
            <div key={index} className="p-4 bg-white border rounded shadow-sm">
              <p className="font-medium">{index + 1}. {mcq.question}</p>
              <ul className="mt-2 ml-4 list-disc">
                {mcq.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
