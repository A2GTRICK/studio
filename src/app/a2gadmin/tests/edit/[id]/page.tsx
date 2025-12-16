"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditTestPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const testRef = doc(db, "test_series", id);
    const testSnap = await getDoc(testRef);

    if (testSnap.exists()) {
      setTest(testSnap.data());
      const qSnap = await getDocs(collection(db, "test_series", id, "questions"));
      setQuestions(qSnap.docs.map((d) => ({ ...d.data(), id: d.id })));
    }
    setLoading(false);
  }

  async function addQuestion() {
    // ---------------- VALIDATION (ADMIN-FINAL) ----------------

    // Trim and normalize options
    const cleanedOptions = newOptions
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    // 1️⃣ Question text must exist
    if (!newQuestionText.trim()) {
      alert("Question text is required.");
      return;
    }

    // 2️⃣ Minimum 2 valid options required
    if (cleanedOptions.length < 2) {
      alert("At least two non-empty options are required.");
      return;
    }

    // 3️⃣ Correct answer must be within range
    if (
      newCorrectIndex == null ||
      newCorrectIndex < 0 ||
      newCorrectIndex >= cleanedOptions.length
    ) {
      alert(
        "Correct answer index is invalid. Please select a valid option."
      );
      return;
    }

    await addDoc(
      collection(db, "test_series", id, "questions"),
      {
        question: { text: newQuestionText.trim() },
        options: cleanedOptions.map((o) => ({ text: o })),
        correctAnswer: newCorrectIndex,
        explanation: newExplanation.trim() || "",
        createdAt: serverTimestamp(),
      }
    );

    setNewQuestionText("");
    setNewOptions(["", "", "", ""]);
    setNewCorrectIndex(0);
    setNewExplanation("");
    load(); // Refresh
  }

  async function deleteQuestion(qid: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    await deleteDoc(doc(db, "test_series", id, "questions", qid));
    load();
  }

  if (loading) return <div>Loading...</div>;
  if (!test) return <div>Test not found</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{test.title}</h1>
      <div className="mt-4">
        {questions.map((q) => (
          <div key={q.id} className="p-2 border my-2">
            <p>{q.question?.text || q.question}</p>
            <Button onClick={() => deleteQuestion(q.id)} variant="destructive">
              Delete
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 border p-4 space-y-2">
        <h3 className="font-bold">Add Question</h3>
        <Textarea
          value={newQuestionText}
          onChange={(e) => setNewQuestionText(e.target.value)}
          placeholder="Question"
        />
        {newOptions.map((opt, i) => (
          <Input
            key={i}
            value={opt}
            onChange={(e) => {
              const o = [...newOptions];
              o[i] = e.target.value;
              setNewOptions(o);
            }}
            placeholder={`Option ${i + 1}`}
          />
        ))}
        <Input
          type="number"
          value={newCorrectIndex}
          onChange={(e) => setNewCorrectIndex(Number(e.target.value))}
          placeholder="Correct (0-3)"
          min="0"
          max="3"
        />
        <Textarea
            value={newExplanation}
            onChange={(e) => setNewExplanation(e.target.value)}
            placeholder="Explanation (optional)"
        />
        <Button onClick={addQuestion}>Add Question</Button>
      </div>
    </div>
  );
}
