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
import { Eye, X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function EditTestPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  // Add Question State
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");

  // Preview Drawer State
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const testRef = doc(db, "test_series", id);
    const testSnap = await getDoc(testRef);

    if (testSnap.exists()) {
      setTest(testSnap.data());
      const qSnap = await getDocs(
        collection(db, "test_series", id, "questions")
      );
      setQuestions(qSnap.docs.map((d, i) => ({ ...d.data(), id: d.id, order: i + 1 })));
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
    <div className="relative flex gap-6">
      {/* MAIN CONTENT */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">{test.title}</h1>

        {/* Question List */}
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="border rounded-lg p-3 flex justify-between items-start"
            >
              <div className="flex gap-4">
                 <Badge variant="secondary" className="h-fit">Q{idx + 1}</Badge>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewQuestion(q)}
                >
                  <Eye className="w-4 h-4 mr-1" /> Preview
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteQuestion(q.id)}
                >
                  <Trash2 size={14}/>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Question */}
        <div className="mt-8 border rounded-lg p-4 space-y-3">
          <h3 className="font-bold text-lg">Add Question</h3>
          <Textarea
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Question text"
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
            min={0}
            max={newOptions.filter(o => o.trim()).length - 1}
            onChange={(e) => setNewCorrectIndex(Number(e.target.value))}
            placeholder="Correct option index (zero-based)"
          />

          <Textarea
            value={newExplanation}
            onChange={(e) => setNewExplanation(e.target.value)}
            placeholder="Explanation (optional)"
          />

          <Button onClick={addQuestion}>Add Question</Button>
        </div>
      </div>

      {/* PREVIEW DRAWER */}
       {previewQuestion && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="w-full max-w-lg h-full bg-background shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Question Preview</h2>
              <Button variant="ghost" onClick={() => setPreviewQuestion(null)}>
                Close
              </Button>
            </div>
      
            <div className="space-y-4">
              <p className="font-semibold">
                {previewQuestion.question?.text || "Question text missing"}
              </p>
      
              <div className="space-y-2">
                {previewQuestion.options?.map((opt: any, idx: number) => {
                  const isCorrect = idx === previewQuestion.correctAnswer;
                  return (
                    <div
                      key={idx}
                      className={`p-2 border rounded flex items-center gap-2 ${
                        isCorrect ? "border-green-500 bg-green-50" : ""
                      }`}
                    >
                      <input type="radio" disabled />
                      <span>{opt.text}</span>
                      {isCorrect && (
                        <span className="ml-auto text-xs text-green-600 font-medium">
                          Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
      
              {previewQuestion.explanation && (
                <div className="mt-4 p-3 bg-secondary/50 rounded">
                  <p className="text-sm font-semibold mb-1">Explanation</p>
                  <p className="text-sm text-muted-foreground">
                    {previewQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
