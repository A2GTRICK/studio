
// src/app/a2gadmin/mcq/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase/config";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

export default function EditMcqSetPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    async function loadSet() {
      setLoading(true);
      try {
        const docRef = doc(db, 'mcqSets', Array.isArray(id) ? id[0] : id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const set = docSnap.data();
          setTitle(set.title || "");
          setCourse(set.course || "");
          setSubject(set.subject || "");
          setYear(set.year || "");
          setDescription(set.description || "");
          setIsPremium(set.isPremium || false);
          setIsPublished(set.isPublished || false);
          setQuestions((set.questions || []).map((q: any) => ({ ...q, id: q.id || uuidv4() })));
        } else {
          setMsg("MCQ set not found.");
        }
      } catch (err) {
        setMsg("Network error.");
      }
      setLoading(false);
    }
    loadSet();
  }, [id]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv4(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        topic: "",
        difficulty: "Medium",
      },
    ]);
  };

  const removeQuestion = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const handleQuestionChange = (qId: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === qId ? { ...q, [field]: value } : q))
    );
  };
  
  const handleOptionChange = (qId: string, optIndex: number, value: string) => {
      setQuestions(questions.map(q => {
          if (q.id === qId) {
              const newOptions = [...q.options];
              newOptions[optIndex] = value;
              return { ...q, options: newOptions };
          }
          return q;
      }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    
    if (!title || !course || !subject) {
      setMsg("Title, Course, and Subject are required.");
      setSaving(false);
      return;
    }

    try {
      const docRef = doc(db, 'mcqSets', Array.isArray(id) ? id[0] : id);
      const payload = {
        title, course, subject, year, description, isPremium, isPublished,
        questionCount: questions.length,
        questions,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, payload);
      setMsg("MCQ set updated successfully!");
    } catch (err: any) {
      setMsg("A network or server error occurred.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="text-foreground max-w-4xl mx-auto">
       <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-4 hover:underline text-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to MCQ Manager
      </button>

      <h1 className="text-2xl font-semibold mb-4">Edit MCQ Set</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-secondary/30 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Set Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="* Title" required />
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="* Subject" required />
            <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="* Course" required />
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
          </div>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="h-24" />
           <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} /> Is Premium</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Published</label>
          </div>
        </div>

        <div className="p-6 bg-secondary/30 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
            <Button type="button" onClick={addQuestion}><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
          </div>
          
          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="p-4 bg-card rounded-md border">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold">Question {qIndex + 1}</p>
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeQuestion(q.id)}><Trash2 className="w-4 h-4"/></Button>
                </div>
                <div className="space-y-3">
                   <Textarea value={q.question} onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)} placeholder="Question text" className="h-20" />
                   <div className="grid grid-cols-2 gap-2">
                       {q.options.map((opt, i) => (
                           <Input key={i} value={opt} onChange={(e) => handleOptionChange(q.id, i, e.target.value)} placeholder={`Option ${i+1}`} />
                       ))}
                   </div>
                   <Input value={q.correctAnswer} onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)} placeholder="Correct Answer (must match an option)" />
                   <Textarea value={q.explanation} onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)} placeholder="Explanation" className="h-24" />
                   <div className="grid grid-cols-2 gap-2">
                      <Input value={q.topic} onChange={(e) => handleQuestionChange(q.id, 'topic', e.target.value)} placeholder="Topic (e.g. Diuretics)" />
                      <select value={q.difficulty} onChange={(e) => handleQuestionChange(q.id, 'difficulty', e.target.value)} className="w-full p-2 rounded-lg border bg-card">
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                      </select>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-6">
          <Button type="submit" disabled={saving} size="lg" className="bg-green-600 hover:bg-green-700">
            {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
