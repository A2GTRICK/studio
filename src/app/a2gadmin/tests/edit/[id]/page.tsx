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
import {
  Eye,
  Pencil,
  Save,
  Trash2,
  GripVertical,
  Crown,
} from "lucide-react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/* =========================================================
   SORTABLE ITEM
========================================================= */

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

function parseBulkQuestions(raw: string) {
  const blocks = raw.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  const parsed: any[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    try {
      const lines = block.split("\n").map(l => l.trim());

      const qLine = lines.find(l => l.startsWith("Q:"));
      const options = lines.filter(l => /^[A-D]\)/.test(l));
      const ansLine = lines.find(l => l.startsWith("ANSWER:"));
      const expLine = lines.find(l => l.startsWith("EXPLAIN:"));

      if (!qLine || options.length < 2 || !ansLine) {
        throw new Error("Missing Q / options / ANSWER");
      }

      const answerChar = ansLine.replace("ANSWER:", "").trim();
      const map = { A: 0, B: 1, C: 2, D: 3 } as any;

      if (!(answerChar in map)) {
        throw new Error("ANSWER must be A/B/C/D");
      }

      parsed.push({
        question: { text: qLine.replace("Q:", "").trim() },
        options: options.map(o => ({ text: o.slice(2).trim() })),
        correctAnswer: map[answerChar],
        explanation: expLine ? expLine.replace("EXPLAIN:", "").trim() : "",
      });
    } catch (e: any) {
      errors.push(`Question ${index + 1}: ${e.message}`);
    }
  });

  return { parsed, errors };
}


/* ========================================================= */

export default function EditTestPage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  /* ---------------- PREMIUM CONTROL ---------------- */
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState<number | "">("");

  /* ---------------- QUESTIONS / UI ---------------- */
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

  // Bulk Import
  const [bulkText, setBulkText] = useState("");
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  // Instructions
  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (test) {
      setIsPremium(test.isPremium === true);
      setPrice(test.price ?? "");
      setInstructions(
        test?.instructions?.content ||
          `GENERAL INSTRUCTIONS

• Each question carries equal marks
• Negative marking may apply
• No calculator allowed
• Do not refresh the page during test
`
      );
      setShowInstructions(test?.instructions?.enabled ?? true);
    }
  }, [test]);

  async function load() {
    setLoading(true);
    const snap = await getDoc(doc(db, "test_series", id));
    if (snap.exists()) {
      const data = snap.data();
      setTest(data);

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
    const cleanedOptions = newOptions.map((o) => o.trim()).filter(Boolean);
    if (!newQuestionText.trim()) return alert("Question text is required");
    if (cleanedOptions.length < 2) return alert("At least two options required");
    if (newCorrectIndex < 0 || newCorrectIndex >= cleanedOptions.length)
      return alert("Correct answer index invalid");

    const testRef = doc(db, "test_series", id);

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

    await updateDoc(testRef, {
      questionCount: (test.questionCount || 0) + 1,
      updatedAt: serverTimestamp(),
    });

    setNewQuestionText("");
    setNewOptions(["", "", "", ""]);
    setNewCorrectIndex(0);
    setNewExplanation("");
    load();
  }

  function handleBulkPreview() {
    const { parsed, errors } = parseBulkQuestions(bulkText);
    setBulkPreview(parsed);
    setBulkErrors(errors);
  }

  async function handleBulkImport() {
    if (!bulkPreview.length || bulkErrors.length) return;
  
    setImporting(true);
  
    const batch = writeBatch(db);
    const baseOrder = questions.length;
  
    bulkPreview.forEach((q, i) => {
      const ref = doc(collection(db, "test_series", id, "questions"));
      batch.set(ref, {
        ...q,
        order: baseOrder + i,
        createdAt: serverTimestamp(),
      });
    });
  
    await batch.commit();
  
    setBulkText("");
    setBulkPreview([]);
    setBulkErrors([]);
    setImporting(false);
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
    
    const testRef = doc(db, "test_series", id);

    await deleteDoc(doc(db, "test_series", id, "questions", qid));

    await updateDoc(testRef, {
      questionCount: Math.max((test.questionCount || 1) - 1, 0),
      updatedAt: serverTimestamp(),
    });

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

  /* =============================
     SAVE PREMIUM SETTINGS
  ============================= */

  async function savePremiumSettings() {
    await updateDoc(doc(db, "test_series", id), {
      isPremium,
      price: isPremium && price ? Number(price) : null,
      updatedAt: serverTimestamp(),
    });
    alert("Premium settings saved.");
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!test) return <div className="p-6">Test not found</div>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{test.title}</h1>

        {isPremium && (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Crown className="w-4 h-4" /> Premium Test
          </Badge>
        )}
      </div>

      {/* =============================
          PREMIUM SETTINGS (NEW)
      ============================= */}

      <Card>
        <CardHeader>
          <CardTitle>Premium Access Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-600" />
              Mark this test as Premium
            </Label>
            <Switch checked={isPremium} onCheckedChange={setIsPremium} />
          </div>

          {isPremium && (
            <div>
              <Label>Price (optional, for future use)</Label>
              <Input
                type="number"
                placeholder="e.g. 99"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pricing is optional. Billing logic remains unchanged.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={savePremiumSettings}
              disabled={isPremium && price === ""}
            >
              Save Premium Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =============================
          INSTRUCTIONS
      ============================= */}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>CBT Instructions (Shown to Students)</CardTitle>
           <div className="flex items-center gap-2">
            <Label>Enable</Label>
            <Switch checked={showInstructions} onCheckedChange={setShowInstructions} />
          </div>
        </CardHeader>

        <CardContent>
          <Textarea
            rows={8}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={async () => {
                await updateDoc(doc(db, "test_series", id), {
                  instructions: {
                    content: instructions,
                    enabled: showInstructions,
                  },
                  updatedAt: serverTimestamp(),
                });
                 alert("Instructions saved.");
              }}
            >
              Save Instructions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =============================
          QUESTIONS, BULK IMPORT, ETC.
      ============================= */}
      <div className="relative flex gap-6">
      {/* MAIN CONTENT */}
      <div className="flex-1 space-y-4">
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

        {/* Bulk Import */}
        <div className="mt-8 border p-4 space-y-3">
          <h3 className="font-bold text-lg">Bulk Import Questions</h3>

          <Textarea
            rows={10}
            value={bulkText}
            onChange={e => setBulkText(e.target.value)}
            placeholder="Paste questions here in the format: Q: ..., A) ..., B) ..., ANSWER: A, EXPLAIN: ..."
          />

          <Button onClick={handleBulkPreview}>Parse & Preview</Button>

          {bulkErrors.length > 0 && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-md">
              {bulkErrors.map((e, i) => (
                <div key={i}>❌ {e}</div>
              ))}
            </div>
          )}

          {bulkPreview.length > 0 && bulkErrors.length === 0 && (
            <>
              <div className="text-sm text-muted-foreground">
                Preview ({bulkPreview.length} questions)
              </div>

               <div className="space-y-3 max-h-60 overflow-y-auto border p-3 rounded-md bg-muted/50">
                {bulkPreview.map((q, i) => (
                  <div key={i} className="border bg-white rounded p-2 text-sm">
                    <p className="font-medium">Q{i + 1}. {q.question.text}</p>
                    <ul className="ml-4 text-xs">
                      {q.options.map((o: any, idx: number) => (
                        <li key={idx} className={idx === q.correctAnswer ? "text-green-600 font-semibold" : ""}>
                          {String.fromCharCode(65 + idx)}) {o.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <Button
                disabled={importing}
                onClick={handleBulkImport}
                className="bg-green-600 text-white"
              >
                {importing ? 'Importing...' : `Import All ${bulkPreview.length} Questions`}
              </Button>
            </>
          )}
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
    </div>
  );
}
