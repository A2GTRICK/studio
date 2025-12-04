"use client";

import React, { useState } from "react";
import BulkUpload from "@/components/a2gadmin/BulkUpload";

export default function CreateTestPage() {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");

  const [questions, setQuestions] = useState<any[]>([]);

  function addQuestion() {
    setQuestions([
      ...questions,
      { question: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "" },
    ]);
  }

  async function saveTest() {
    const res = await fetch("/api/a2gadmin/tests", {
      method: "POST",
      body: JSON.stringify({
        title,
        course,
        subject,
        year,
        difficulty,
        description,
        questions,
      }),
    });

    const data = await res.json();
    if (data.id) {
      alert("Test created!");
      window.location.href = "/a2gadmin/tests";
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Test</h1>

      <div className="space-y-3">
        <input
          placeholder="Test Title"
          className="w-full p-3 border rounded-lg"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Course"
          className="w-full p-3 border rounded-lg"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />

        <input
          placeholder="Subject"
          className="w-full p-3 border rounded-lg"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          placeholder="Year"
          className="w-full p-3 border rounded-lg"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full p-3 border rounded-lg"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* BULK UPLOAD */}
        <BulkUpload
          onUpload={(bulkQs) => setQuestions([...questions, ...bulkQs])}
        />

        {/* MANUAL QUESTIONS */}
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-bold">Manual Questions</h2>

          {questions.map((q, i) => (
            <div key={i} className="border p-4 rounded-lg space-y-2">
              <input
                placeholder="Question"
                className="w-full p-2 border rounded"
                value={q.question}
                onChange={(e) => {
                  questions[i].question = e.target.value;
                  setQuestions([...questions]);
                }}
              />

              {["A", "B", "C", "D"].map((opt) => (
                <input
                  key={opt}
                  placeholder={`Option ${opt}`}
                  className="w-full p-2 border rounded"
                  value={q[`option${opt}`]}
                  onChange={(e) => {
                    questions[i][`option${opt}`] = e.target.value;
                    setQuestions([...questions]);
                  }}
                />
              ))}

              <input
                placeholder="Correct Answer (A/B/C/D)"
                className="w-full p-2 border rounded"
                value={q.answer}
                onChange={(e) => {
                  questions[i].answer = e.target.value;
                  setQuestions([...questions]);
                }}
              />
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full bg-purple-600 text-white py-2 rounded-lg"
          >
            + Add Question
          </button>
        </div>

        <button
          onClick={saveTest}
          className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-bold"
        >
          Save Test
        </button>
      </div>
    </div>
  );
}
