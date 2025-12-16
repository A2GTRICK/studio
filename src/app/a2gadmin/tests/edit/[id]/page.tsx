"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
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
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, CheckCircle2 } from "lucide-react";

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
      setQuestions(qSnap.docs.map((d, i) => ({ ...d.data(), id: d.id, order: i + 1 })));
    }
    setLoading(false);
  }

  async function addQuestion() {
    const cleanedOptions = newOptions.map((o) => o.trim()).filter(Boolean);

    if (!newQuestionText.trim()) return alert("Question text is required");
    if (cleanedOptions.length < 2) return alert("At least two options required");
    if (newCorrectIndex < 0 || newCorrectIndex >= cleanedOptions.length)
      return alert("Correct answer index invalid");

    await addDoc(collection(db, "test_series", id, "questions"), {
      question: { text: newQuestionText.trim() },
      options: cleanedOptions.map((o) => ({ text: o })),
      correctAnswer: newCorrectIndex,
      explanation: newExplanation.trim() || "",
      createdAt: serverTimestamp(),
    });

    setNewQuestionText("");
    setNewOptions(["", "", "", ""]);
    setNewCorrectIndex(0);
    setNewExplanation("");
    load();
  }

  async function deleteQuestion(qid: string) {
    if (!confirm("Delete this question permanently?")) return;
    await deleteDoc(doc(db, "test_series", id, "questions", qid));
    load();
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!test) return <div className="p-6">Test not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{test.title}</h1>

      {/* QUESTION LIST – STEP 2.1 */}
      <div className="border rounded-xl overflow-hidden">
        {questions.length === 0 ? (
          <div className="p-6 text-muted-foreground">No questions added yet.</div>
        ) : (
          questions.map((q, index) => (
            <div key={q.id} className="border-b last:border-b-0 p-4 flex justify-between gap-4">
              <div className="flex gap-4">
                <Badge variant="secondary" className="h-fit">Q{index + 1}</Badge>
                <div>
                  <p className="font-medium line-clamp-2">
                    {q.question?.text || "Question text missing"}
                  </p>
                  <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{q.options?.length || 0} options</span>
                    {typeof q.correctAnswer === "number" && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 size={14} /> Correct set
                      </span>
                    )}
                    {q.explanation && <span>Has explanation</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye size={14} />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteQuestion(q.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD QUESTION */}
      <div className="border p-4 rounded-xl space-y-2">
        <h3 className="font-semibold">Add Question</h3>
        <Textarea value={newQuestionText} onChange={(e) => setNewQuestionText(e.target.value)} placeholder="Question text" />
        {newOptions.map((opt, i) => (
          <Input
            key={i}
            value={opt}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => {
              const o = [...newOptions];
              o[i] = e.target.value;
              setNewOptions(o);
            }}
          />
        ))}
        <Input
          type="number"
          min={0}
          value={newCorrectIndex}
          onChange={(e) => setNewCorrectIndex(Number(e.target.value))}
          placeholder="Correct option index"
        />
        <Textarea value={newExplanation} onChange={(e) => setNewExplanation(e.target.value)} placeholder="Explanation (optional)" />
        <Button onClick={addQuestion}>Add Question</Button>
      </div>
    </div>
  );
}
