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
    if (!newQuestionText.trim()) return;

    await addDoc(
      collection(db, "test_series", id, "questions"),
      {
        question: { text: newQuestionText }, // ✅ STANDARD
        options: newOptions.map((o) => ({ text: o })),
        correctAnswer: newCorrectIndex,
        createdAt: serverTimestamp(),
      }
    );

    setNewQuestionText("");
    setNewOptions(["", "", "", ""]);
    load(); // Refresh
  }

  async function deleteQuestion(qid: string) {
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
            <p>{q.question.text}</p>
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
        />
        <Button onClick={addQuestion}>Add Question</Button>
      </div>
    </div>
  );
}
