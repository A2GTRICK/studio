
// File: src/app/a2gadmin/mcq/create/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Plus, Trash2, Save, ArrowLeft, BookDown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

const bulkExample = `Q: What is the primary mechanism of action for benzodiazepines?
A: They enhance the effect of the neurotransmitter GABA.
B: They block dopamine receptors in the brain.
C: They inhibit the enzyme acetylcholinesterase.
D: They act as selective serotonin reuptake inhibitors.
ANSWER: A
EXPLAIN: Benzodiazepines bind to the GABAA receptor, which potentiates the effect of GABA, leading to CNS depression.

Q: Which of the following is a Schedule H drug?
A: Paracetamol
B: Aspirin
C: Diazepam
D: Cetirizine
ANSWER: C
EXPLAIN: Diazepam is a prescription-only drug listed under Schedule H of the Drugs and Cosmetics Act.`;

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

  const removeQuestion = (id: string) => setQuestions(questions.filter((q) => q.id !== id));

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
              // if the option changed and it no longer matches the stored correctAnswer, clear correctAnswer
              const currentCorrect = q.correctAnswer?.trim();
              if (currentCorrect && !newOptions.map(o => o.trim()).includes(currentCorrect)) {
                return { ...q, options: newOptions, correctAnswer: "" };
              }
              return { ...q, options: newOptions };
          }
          return q;
      }));
  };

  // Bulk parse (existing logic) — returns array of questions
  const handleBulkParse = () => {
    const blocks = bulkText.trim().split(/\n\s*\n/);
    const newQuestions: Question[] = [];
    let errors = 0;

    blocks.forEach(block => {
        const lines = block.split('\n').map(l=>l.trim()).filter(l=>l);
        if (lines.length < 3) { errors++; return; }

        const questionLine = lines.find(l => /^Q[:\.]/i.test(l));
        const optionA = lines.find(l => /^A[:\.]/i.test(l));
        const optionB = lines.find(l => /^B[:\.]/i.test(l));
        const optionC = lines.find(l => /^C[:\.]/i.test(l));
        const optionD = lines.find(l => /^D[:\.]/i.test(l));
        const answerLine = lines.find(l => /^(?:ANSWER|Correct)[:\.]/i.test(l));
        const explainLine = lines.find(l => /^(?:EXPLAIN|Explanation)[:\.]/i.test(l));

        if (!questionLine || !optionA || !optionB || !optionC || !optionD || !answerLine) { errors++; return; }

        const optionsMap: { [key: string]: string } = {
            'A': optionA.replace(/^A[:\.]\s*/i,'').trim(),
            'B': optionB.replace(/^B[:\.]\s*/i,'').trim(),
            'C': optionC.replace(/^C[:\.]\s*/i,'').trim(),
            'D': optionD.replace(/^D[:\.]\s*/i,'').trim(),
        };

        const answerKey = answerLine.replace(/^(?:ANSWER|Correct)[:\.]\s*/i,'').trim().charAt(0).toUpperCase();
        const correctAnswer = optionsMap[answerKey];

        if (!correctAnswer) { errors++; return; }

        newQuestions.push({
            id: uuidv4(),
            question: questionLine.replace(/^Q[:\.]\s*/i,'').trim(),
            options: Object.values(optionsMap),
            correctAnswer: correctAnswer,
            explanation: explainLine ? explainLine.replace(/^(?:EXPLAIN|Explanation)[:\.]\s*/i,'').trim() : '',
            topic: "",
            difficulty: "Medium",
        });
    });
    
    if (newQuestions.length > 0) setQuestions(prev => [...prev, ...newQuestions]);

    setBulkText("");
    alert(`${newQuestions.length} questions added successfully. ${errors > 0 ? `${errors} blocks had incorrect format and were skipped.` : ''}`);
  };

  function isQuestionValid(q: Question) {
    if (!q.question.trim()) return false;
    const hasOption = q.options.some(o => o && o.trim());
    if (!hasOption) return false;
    if (!q.correctAnswer || !q.options.map(o=>o.trim()).includes(q.correctAnswer.trim())) return false;
    return true;
  }

  function isAllValid() {
    if (!title || !course || !subject) return false;
    if (questions.length === 0) return true; // allow empty set creation if desired
    return questions.every(isQuestionValid);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    if (!title || !course || !subject) {
      setMsg("Title, Course, and Subject are required.");
      setLoading(false);
      return;
    }

    if (!isAllValid()) {
      setMsg('Some questions are invalid. Please complete all questions and select correct answers.');
      setLoading(false);
      return;
    }

    const payload = {
      title, course, subject, year, description, isPremium, isPublished,
      questionCount: questions.length,
      questions,
    };

    try {
       const res = await fetch('/api/a2gadmin/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create MCQ set');
      }

      const { id } = await res.json();
      setMsg("MCQ set created successfully!");
      router.push(`/a2gadmin/mcq/edit/${id}`);

    } catch (err: any) {
      console.error("Admin create mcq error:", err);
      setMsg(err.message || "A permission or server error occurred.");
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="text-foreground max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-4 hover:underline text-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to MCQ Manager
      </button>

      <h1 className="text-2xl font-semibold mb-4">Create New MCQ Set</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 bg-secondary/30 rounded-lg border space-y-4">
          <h2 className="text-lg font-semibold">Set Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="* Title" required />
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="* Subject (e.g., Pharmacology)" required />
            <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="* Course (e.g. B.Pharm)" required />
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (e.g. 2nd Year)" />
          </div>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="h-24" />
          <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} /> Is Premium</label>
              <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Published</label>
          </div>
        </div>

        <div className="p-6 bg-secondary/30 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Bulk Add Questions</h2>
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Paste questions here using the specified format. Separate question blocks with a blank line."
            className="h-48"
          />
          <div className="mt-3 flex items-center gap-4">
            <Button type="button" onClick={handleBulkParse}>
              <BookDown className="w-4 h-4 mr-2" /> Parse & Add Questions
            </Button>
            <Accordion type="single" collapsible className="w-auto border-none">
              <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="text-sm py-0 hover:no-underline flex items-center gap-2 text-muted-foreground">
                    <HelpCircle className="w-4 h-4" /> Show Example
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="text-xs p-3 mt-2 bg-card rounded-md whitespace-pre-wrap max-w-full overflow-auto border">
                    {bulkExample}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                   {/* CORRECT ANSWER DROPDOWN - Option C UI; stores actual option text */}
                   <div>
                     <label className="text-sm font-medium">Correct answer</label>
                     <select
                       value={q.correctAnswer}
                       onChange={(e) => handleQuestionChange(q.id, 'correctAnswer', e.target.value)}
                       className="w-full p-2 rounded-md border bg-card mt-1"
                     >
                       <option value="">Select correct answer</option>
                       {q.options.map((opt, idx) => (
                         <option key={idx} value={opt} disabled={!opt.trim()}>{String.fromCharCode(65 + idx)}) {opt || '— Not available —'}</option>
                       ))}
                     </select>
                     <div className="mt-1 text-xs">
                       {q.correctAnswer && q.options.map(o=>o.trim()).includes(q.correctAnswer.trim()) ? (
                         <span className="text-green-600">Correct answer selected</span>
                       ) : (
                         <span className="text-red-600">No valid correct answer selected</span>
                       )}
                     </div>
                   </div>
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
          <Button type="submit" disabled={loading || !isAllValid()} size="lg" className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {loading ? "Saving..." : "Save MCQ Set"}
          </Button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
