"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, X, Pencil, Save, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab text-muted-foreground"
      >
        <GripVertical size={18} />
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
}

export default function EditTestPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  // Add Question
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrectIndex, setNewCorrectIndex] = useState(0);
  const [newExplanation, setNewExplanation] = useState("");

  // Preview
  const [previewQuestion, setPreviewQuestion] = useState<any | null>(null);

  // Inline Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);
    const testSnap = await getDoc(doc(db, "test_series", id));
    if (testSnap.exists()) {
      setTest(testSnap.data());
      const qSnap = await getDocs(
        query(
          collection(db, "test_series", id, "questions"),
          orderBy("order", "asc")
        )
      );
      setQuestions(
        qSnap.docs.map((d, index) => ({
          ...d.data(),
          id: d.id,
          order: d.data().order ?? index,
        }))
      );
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

  async function saveEdit() {
    if (!editingId || !editData) return;

    if (!editData?.question?.text?.trim()) {
      alert("Question text required");
      return;
    }

    await updateDoc(
      doc(db, "test_series", id, "questions", editingId),
      {
        question: { text: editData.question.text.trim() },
        options: editData.options,
        correctAnswer: editData.correctAnswer,
        explanation: editData.explanation || "",
        updatedAt: serverTimestamp(),
      }
    );

    setEditingId(null);
    setEditData(null);
    load();
  }

  async function deleteQuestion(qid: string) {
    if (!confirm("Delete this question permanently?")) return;
    await deleteDoc(doc(db, "test_series", id, "questions", qid));
    load();
  }

  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    const reordered = arrayMove(questions, oldIndex, newIndex);
    setQuestions(reordered);

    const batch = writeBatch(db);

    reordered.forEach((q, index) => {
      batch.update(doc(db, "test_series", id, "questions", q.id), {
        order: index,
      });
    });

    await batch.commit();
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!test) return <div className="p-6">Test not found</div>;

  return (
    <div className="relative flex gap-6">
      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-4">
        <h1 className="text-2xl font-bold">{test.title}</h1>

        {/* Question List */}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((q, idx) => (
              <SortableItem key={q.id} id={q.id}>
                <div className="border rounded-lg p-3">
                  {! (editingId === q.id) ? (
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <Badge variant="secondary" className="h-fit">
                          Q{idx + 1}
                        </Badge>
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
                          onClick={() => {
                            setPreviewQuestion(q);
                            setEditingId(null);
                          }}
                        >
                          <Eye size={14} className="mr-1" /> Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(q.id);
                            setEditData(JSON.parse(JSON.stringify(q)));
                            setPreviewQuestion(null);
                          }}
                        >
                          <Pencil size={14} className="mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteQuestion(q.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Textarea
                        value={editData.question.text}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            question: { text: e.target.value },
                          })
                        }
                      />
                      {editData.options.map((o: any, i: number) => (
                        <Input
                          key={i}
                          value={o.text}
                          onChange={(e) => {
                            const opts = [...editData.options];
                            opts[i].text = e.target.value;
                            setEditData({ ...editData, options: opts });
                          }}
                        />
                      ))}
                      <Input
                        type="number"
                        value={editData.correctAnswer}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            correctAnswer: Number(e.target.value),
                          })
                        }
                        min={0}
                        max={editData.options.length - 1}
                      />
                      <Textarea
                        value={editData.explanation || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            explanation: e.target.value,
                          })
                        }
                        placeholder="Explanation"
                      />
                      <div className="flex gap-2">
                        <Button onClick={saveEdit}>
                          <Save className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setEditData(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>

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
            max={newOptions.filter((o) => o.trim()).length - 1}
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
