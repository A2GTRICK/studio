
// src/app/a2gadmin/mcq/create/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Plus, Trash2, Save, ArrowLeft, BookDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

export default function CreateMcqSetPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [bulkText, setBulkText] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
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

  const handleBulkParse = () => {
    const blocks = bulkText.trim().split(/\n\s*\n/);
    const newQuestions: Question[] = [];
    let errors = 0;

    blocks.forEach(block => {
      const lines = block.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 7) {
        const [question, opt1, opt2, opt3, opt4, correctAnswer, explanation] = lines;
        newQuestions.push({
          id: uuidv4(),
          question: question.trim(),
          options: [opt1.trim(), opt2.trim(), opt3.trim(), opt4.trim()],
          correctAnswer: correctAnswer.trim(),
          explanation: explanation.trim(),
          topic: "",
          difficulty: "Medium",
        });
      } else {
        errors++;
      }
    });
    
    if (newQuestions.length > 0) {
        setQuestions(prev => [...prev, ...newQuestions]);
    }

    setBulkText("");
    alert(`${newQuestions.length} questions added successfully. ${errors > 0 ? `${errors} blocks had incorrect format and were skipped.` : ''}`);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    
    if (!title || !course || !subject) {
      setMsg("Title, Course, and Subject are required.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title, course, subject, year, description, isPremium, isPublished,
        questionCount: questions.length,
        questions,
      };

      const res = await fetch("/api/a2gadmin/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed to create MCQ set.");
      } else {
        setMsg("MCQ set created successfully!");
        router.push(`/a2gadmin/mcq/edit/${data.id}`);
      }
    } catch (err: any) {
      setMsg("A network or server error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-white max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-4 hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Back to MCQ Manager
      </button>

      <h1 className="text-2xl font-semibold mb-4">Create New MCQ Set</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Metadata Section */}
        <div className="p-6 bg-white/10 rounded-lg border border-white/20">
          <h2 className="text-lg font-semibold mb-4">Set Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="* Title" className="p-3 rounded bg-white/10 w-full" required />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="* Subject (e.g., Pharmacology)" className="p-3 rounded bg-white/10 w-full" required />
            <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="* Course (e.g. B.Pharm)" className="p-3 rounded bg-white/10 w-full" required />
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (e.g. 2nd Year)" className="p-3 rounded bg-white/10 w-full" />
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="p-3 mt-4 rounded bg-white/10 w-full h-24" />
          <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} /> Is Premium</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Published</label>
          </div>
        </div>

        {/* Bulk Add Questions Section */}
        <div className="p-6 bg-white/10 rounded-lg border border-white/20">
          <h2 className="text-lg font-semibold mb-4">Bulk Add Questions</h2>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste questions here. Each block should have 7 lines: question, 4 options, correct answer, and explanation. Separate blocks with a blank line."
            className="w-full p-3 rounded bg-white/10 h-48"
          />
          <Button type="button" onClick={handleBulkParse} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
            <BookDown className="w-4 h-4 mr-2" /> Parse & Add Questions
          </Button>
        </div>


        {/* Questions Section */}
        <div className="p-6 bg-white/10 rounded-lg border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
            <Button type="button" onClick={addQuestion} className="bg-purple-600 hover:bg-purple-700 text-white"><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
          </div>
          
          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div key={q.id} className="p-4 bg-white/5 rounded-md border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <p className="font-bold">Question {qIndex + 1}</p>
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeQuestion(q.id)}><Trash2 className="w-4 h-4"/></Button>
                </div>
                <div className="space-y-3">
                   <textarea value={q.question} onChange={(e) => handleQuestionChange(q.id, 'question', e.target.value)} placeholder="Question text" className="w-full p-2 rounded bg-white/10 h-20" />
                   <div className="grid grid-cols-2 gap-2">
                       {q.options.map((opt, i) => (
                           <input key={i} value={opt} onChange={(e) => handleOptionChange(q.id, i, e.target.value)} placeholder={`Option ${i+1}`} className="p-2 rounded bg-white/10 w-full" />
                       ))}
                   </div>
                   <input value={q.correctAnswer} onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)} placeholder="Correct Answer (must match an option)" className="w-full p-2 rounded bg-white/10" />
                   <textarea value={q.explanation} onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)} placeholder="Explanation" className="w-full p-2 rounded bg-white/10 h-24" />
                   <div className="grid grid-cols-2 gap-2">
                      <input value={q.topic} onChange={(e) => handleQuestionChange(q.id, 'topic', e.target.value)} placeholder="Topic (e.g. Diuretics)" className="w-full p-2 rounded bg-white/10" />
                      <select value={q.difficulty} onChange={(e) => handleQuestionChange(q.id, 'difficulty', e.target.value)} className="w-full p-2 rounded bg-white/10 text-white">
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
          <Button type="submit" disabled={loading} size="lg" className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {loading ? "Saving..." : "Save MCQ Set"}
          </Button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
