"use client";

import React, { useState } from "react";

interface BulkUploadProps {
  onUpload: (questions: { question: string; optionA: string; optionB: string; optionC: string; optionD: string; answer: string }[]) => void;
}

export default function BulkUpload({ onUpload }: BulkUploadProps) {
  const [text, setText] = useState("");

  function parseBulkText() {
    try {
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const questions = [];

      for (const line of lines) {
        const parts = line.split("|");
        if (parts.length !== 6) continue;

        questions.push({
          question: parts[0],
          optionA: parts[1],
          optionB: parts[2],
          optionC: parts[3],
          optionD: parts[4],
          answer: parts[5],
        });
      }

      onUpload(questions);
      alert(`Uploaded ${questions.length} questions successfully.`);
    } catch (e) {
      alert("Invalid format. Use: Question | A | B | C | D | Answer");
    }
  }

  return (
    <div className="border p-4 rounded-lg bg-purple-50">
      <h2 className="text-lg font-bold text-purple-700 mb-2">Bulk Upload Questions</h2>

      <textarea
        className="w-full h-40 border rounded-lg p-2 text-sm"
        placeholder="Example format:
What is pharmacology? | Study of drugs | Study of plants | Study of cells | Study of blood | A"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={parseBulkText}
        className="mt-3 w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700"
      >
        Upload Bulk Questions
      </button>
    </div>
  );
}
