"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BulkUpload from "@/components/a2gadmin/BulkUpload";

export default function EditTestPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [description, setDescription] = useState("");

  const [questions, setQuestions] = useState<any[]>([]);

  // -------------------------
  // FETCH EXISTING TEST
  // -------------------------
  async function loadTest() {
    try {
      const res = await fetch("/api/a2gadmin/tests");
      const data = await res.json();
      const found = data.tests.find((t: any) => t.id === id);

      if (!found) return;

      setTest(found);

      // Prefill form
      setTitle(found.title || "");
      setCourse(found.course || "");
      setSubject(found.subject || "");
      setYear(found.year || "");
      setDifficulty(found.difficulty || "Easy");
      setDescription(found.description || "");

      setQuestions(found.questions || []);
      setLoading(false);
    } catch (e) {
      console.error("Failed to load test:", e);
    }
  }

  useEffect(() => {
    if (id) loadTest();
  }, [id]);

  // -------------------------
  // SAVE CHANGES
  // -------------------------
  async function saveChanges() {
    const res = await fetch(`/api/a2gadmin/tests?id=${id}`, {
      method: "PUT",
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

    if (data.ok) {
      alert("Test updated successfully!");
      window.location.href = "/a2gadmin/tests";
    } else {
      alert("Failed to update test");
    }
  }

  // -------------------------
  // ADD A QUESTION
  // -------------------------
  function addQuestion() {
    setQuestions([
      ...questions,
      {
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        answer: "",
      },
    ]);
  }

  // -------------------------
  // REMOVE A QUESTION
  // -------------------------
  function removeQuestion(i: number) {
    if (!confirm("Delete this question?")) return;
    const updated = [...questions];
    updated.splice(i, 1);
    setQuestions(updated);
  }

  if (loading) return <div className="p-10 text-center">Loading…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Edit Test</h1>

      <div className="space-y-4">

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

        <select
          className="w-full p-3 border rounded-lg"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Easy</option>
          <option>Moderate</option>
          <option>Hard</option>
        </select>

        {/* B U L K   U P L O A D */}
        <BulkUpload
          onUpload={(bulkQs) => setQuestions([...questions, ...bulkQs])}
        />

        <h2 className="text-lg font-bold mt-6">Questions</h2>

        {questions.map((q, i) => (
          <div key={i} className="border p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-purple-700">Q{i + 1}</span>
              <button
                onClick={() => removeQuestion(i)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>

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

        <button
          onClick={saveChanges}
          className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-bold"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
