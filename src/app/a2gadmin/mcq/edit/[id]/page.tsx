
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Plus, Trash2, Save, ArrowLeft, Upload, Eye, FilePlus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Premium MCQ editor: bulk upload (text/CSV/JSON), preview, validation, save, local draft

type EditQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  topic?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
};

export default function EditMcqSetPagePremium() {
  const params = useParams() as any;
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState<number | ''>('');
  const [isPublished, setIsPublished] = useState(false);

  const [questions, setQuestions] = useState<EditQuestion[]>([]);
  const [history, setHistory] = useState<EditQuestion[][]>([]);

  // UI state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draftKey = `a2g:mcq:draft:${id}`;

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/a2gadmin/mcq?id=${id}`);
        if (!res.ok) {
            throw new Error(`Failed to load MCQ set: ${res.statusText}`);
        }
        const data = await res.json();
        const payload = data.set;
        
        if (!payload) {
          setMsg("MCQ set not found");
          setLoading(false);
          return;
        }

        if (!mounted) return;
        setTitle(payload.title || "");
        setCourse(payload.course || "");
        setSubject(payload.subject || "");
        setYear(payload.year || "");
        setDescription(payload.description || "");
        setIsPremium(!!payload.isPremium);
        setPrice(payload.price ?? '');
        setIsPublished(!!payload.isPublished);
        const incoming = (payload.questions || []).map((q: any) => ({
          id: q.id || uuidv4(),
          question: q.question || "",
          options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
          correctAnswer: q.correctAnswer || "",
          explanation: q.explanation || "",
          topic: q.topic || "",
          difficulty: q.difficulty || "Medium",
        }));

        // load draft if exists
        const local = typeof window !== 'undefined' ? localStorage.getItem(draftKey) : null;
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setQuestions(Array.isArray(parsed) ? parsed : incoming);
          } catch {
            setQuestions(incoming);
          }
        } else setQuestions(incoming);

        setHistory([incoming]);
        setMsg(null);
      } catch (err) {
        console.error(err);
        setMsg("Network error loading MCQ set");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, draftKey]);

  // autosave local draft
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(() => {
      try { localStorage.setItem(draftKey, JSON.stringify(questions)); } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, [questions, id, draftKey]);

  function pushHistory() {
    setHistory((h) => [JSON.parse(JSON.stringify(questions)), ...h].slice(0, 20));
  }

  function addBlankQuestion() {
    pushHistory();
    setQuestions((q) => [...q, { id: uuidv4(), question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "", topic: "", difficulty: "Medium" }]);
  }

  function removeQuestion(qid: string) {
    pushHistory();
    setQuestions((q) => q.filter((x) => x.id !== qid));
  }

  function updateQuestion(qid: string, patch: Partial<EditQuestion>) {
    setQuestions((q) => q.map((it) => (it.id === qid ? { ...it, ...patch } : it)));
  }

  function undo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const [latest, ...rest] = h;
      setQuestions(latest);
      return rest;
    });
  }

  // Bulk parsing: supports structured text and simple CSV
  function parseBulkText(raw: string) {
    // Split blocks by blank line
    const blocks = raw.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);
    const parsed: EditQuestion[] = [];
    for (const block of blocks) {
      // Look for lines starting with Q:, A), B), C), D), Correct:, Explanation:, Topic:, Difficulty:
      const lines = block.split(/\n/).map((l) => l.trim());
      const q: EditQuestion = { id: uuidv4(), question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "", topic: "", difficulty: "Medium" };
      for (const ln of lines) {
        if (/^Q[:\.]\s*/i.test(ln)) q.question = ln.replace(/^Q[:\.]\s*/i, "").trim();
        else if (/^[A-D][)\.]\s*/.test(ln)) {
          const idx = ln.charCodeAt(0) - 65;
          if(idx >= 0 && idx < 4) q.options[idx] = ln.replace(/^[A-D][)\.]\s*/, "").trim();
        } else if (/^Correct[:\.]\s*/i.test(ln)) q.correctAnswer = ln.replace(/^Correct[:\.]\s*/i, "").trim();
        else if (/^Explanation[:\.]\s*/i.test(ln)) q.explanation = ln.replace(/^Explanation[:\.]\s*/i, "").trim();
        else if (/^Topic[:\.]\s*/i.test(ln)) q.topic = ln.replace(/^Topic[:\.]\s*/i, "").trim();
        else if (/^Difficulty[:\.]\s*/i.test(ln)) {
          const d = ln.replace(/^Difficulty[:\.]\s*/i, "").trim();
          if (d === "Easy" || d === "Medium" || d === "Hard") q.difficulty = d as any;
        } else {
          // fallbacks: if first non-empty and q.question empty, treat as question
          if (!q.question) q.question = ln;
        }
      }
      parsed.push(q);
    }
    return parsed;
  }

  function handleBulkPasteApply() {
    try {
      const parsed = parseBulkText(bulkText);
      if (parsed.length === 0) { setMsg('No valid questions parsed from bulk text'); return; }
      pushHistory();
      setQuestions((q) => [...q, ...parsed]);
      setBulkModalOpen(false);
      setBulkText("");
      setMsg(`${parsed.length} questions added from bulk input`);
    } catch (err) {
      console.error(err);
      setMsg('Failed to parse bulk input');
    }
  }

  function handleCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const txt = String(e.target?.result ?? "");
      // naive CSV: header optional. Expect columns: question, option1, option2, option3, option4, correct, explanation, topic, difficulty
      const lines = txt.split(/\r?\n/).filter(Boolean);
      const parsed: EditQuestion[] = [];
      const header = lines[0].split(/,|\t/).map(h => h.trim().toLowerCase());
      const hasHeader = /question/.test(header.join(' '));
      const start = hasHeader ? 1 : 0;
      for (let i = start; i < lines.length; i++) {
        const cols = lines[i].split(/,|\t/).map(c => c.trim());
        if (cols.length < 2) continue;
        const q: EditQuestion = { id: uuidv4(), question: '', options: ["", "", "", ""], correctAnswer: '', explanation: '', topic: '', difficulty: 'Medium' };
        if (hasHeader) {
          for (let k = 0; k < header.length; k++) {
            const h = header[k];
            const v = cols[k] ?? '';
            if (/question/.test(h)) q.question = v;
            else if (/option1|a/.test(h)) q.options[0] = v;
            else if (/option2|b/.test(h)) q.options[1] = v;
            else if (/option3|c/.test(h)) q.options[2] = v;
            else if (/option4|d/.test(h)) q.options[3] = v;
            else if (/correct/.test(h)) q.correctAnswer = v;
            else if (/explanation/.test(h)) q.explanation = v;
            else if (/topic/.test(h)) q.topic = v;
            else if (/difficulty/.test(h)) q.difficulty = (v || 'Medium') as any;
          }
        } else {
          // fallback mapping
          q.question = cols[0];
          for (let k = 1; k <= 4; k++) if(k-1 < q.options.length) q.options[k-1] = cols[k] ?? '';
          q.correctAnswer = cols[5] ?? '';
          q.explanation = cols[6] ?? '';
        }
        parsed.push(q);
      }
      if (parsed.length) {
        pushHistory();
        setQuestions((q) => [...q, ...parsed]);
        setBulkModalOpen(false);
        setMsg(`${parsed.length} questions added from CSV`);
      } else setMsg('No rows parsed from CSV');
    };
    reader.readAsText(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type === 'application/json' || f.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result ?? ''));
          if (Array.isArray(parsed)) { pushHistory(); setQuestions((q) => [...q, ...parsed.map((it:any)=>({ id: uuidv4(), question: it.question||'', options: it.options||['','','',''], correctAnswer: it.correctAnswer||'', explanation: it.explanation||'', topic: it.topic||'', difficulty: it.difficulty||'Medium' }))]); setMsg('Imported JSON questions'); }
          else setMsg('JSON must be an array of questions');
        } catch (err) { setMsg('Invalid JSON file'); }
      };
      reader.readAsText(f);
      return;
    }
    // assume CSV or text
    handleCsvFile(f);
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true); setMsg(null);
    // basic validation: ensure each question has at least one option and correctAnswer matching one option
    for (const [i,q] of questions.entries()) {
      if (!q.question.trim()) { setMsg(`Question ${i+1} is empty`); setSaving(false); return; }
      if (!q.options.some(o=>o && o.trim())) { setMsg(`Question ${i+1} has no options`); setSaving(false); return; }
      if (!q.correctAnswer || !q.options.map(o=>o.trim()).includes(q.correctAnswer.trim())) { setMsg(`Question ${i+1} has invalid correct answer`); setSaving(false); return; }
    }

    try {
      const payload = { title, course, subject, year, description, isPremium, isPublished, questions, questionCount: questions.length, price: isPremium && price ? Number(price) : null };
      
      const res = await fetch(`/api/a2gadmin/mcq?id=${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to save MCQ set');
      }

      setMsg('Saved successfully');
      try { localStorage.removeItem(draftKey); } catch {}
    } catch (err: any) {
      console.error(err);
      setMsg(err.message || 'Failed to save to server');
    } finally { setSaving(false); }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${(title||'mcq-set').replace(/[^a-z0-9]/gi,'_').slice(0,60)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  if (loading) return <div className="p-6 text-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={() => router.back()} className="text-sm text-primary hover:underline flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Back</button>
          <h1 className="text-2xl font-semibold">Edit MCQ Set (Premium)</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => exportJson()}><Download className="w-4 h-4 mr-2"/>Export JSON</Button>
          <input ref={fileInputRef} type="file" accept=".csv,application/json,text/*" onChange={handleFileInput} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} variant="outline"><FilePlus className="w-4 h-4 mr-2"/>Import (CSV/JSON)</Button>
          <Button onClick={() => setBulkModalOpen(true)}><Upload className="w-4 h-4 mr-2"/>Bulk</Button>
          <Button onClick={() => setPreviewOpen(true)} variant="outline"><Eye className="w-4 h-4 mr-2"/>Preview</Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-4 bg-white rounded shadow-sm border">
          <h2 className="font-semibold mb-2">Set Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="* Title" required />
            <Input value={subject} onChange={(e)=>setSubject(e.target.value)} placeholder="* Subject" required />
            <Input value={course} onChange={(e)=>setCourse(e.target.value)} placeholder="* Course" required />
            <Input value={year} onChange={(e)=>setYear(e.target.value)} placeholder="Year" />
            <div className="col-span-1 md:col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={isPremium} onChange={(e)=>setIsPremium(e.target.checked)} /> Premium</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)} /> Published</label>
              {isPremium && (
                <div className="flex items-center gap-2">
                    <Label htmlFor="price" className="text-sm">Price (optional)</Label>
                    <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')} className="w-24" placeholder="e.g. 20"/>
                </div>
              )}
            </div>
            <div className="md:col-span-3"><Textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" className="h-20"/></div>
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow-sm border">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Questions ({questions.length})</h2>
            <div className="flex gap-2">
              <Button type="button" onClick={addBlankQuestion}><Plus className="w-4 h-4 mr-2"/>Add</Button>
              <Button type="button" variant="outline" onClick={undo}>Undo</Button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-3 border rounded bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold">Question {idx+1}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="destructive" onClick={()=>removeQuestion(q.id)}><Trash2 className="w-4 h-4"/></Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Textarea value={q.question} onChange={(e)=>updateQuestion(q.id, { question: e.target.value })} className="h-20" placeholder="Question text" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => (
                      <Input key={i} value={opt} onChange={(e)=>{ const newOpts=[...q.options]; if(i<newOpts.length) {newOpts[i]=e.target.value;} updateQuestion(q.id,{ options:newOpts }); }} placeholder={`Option ${i+1}`} />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Input value={q.correctAnswer} onChange={(e)=>updateQuestion(q.id,{ correctAnswer: e.target.value })} placeholder="Correct answer (must exactly match an option)" />
                    <Input value={q.topic||''} onChange={(e)=>updateQuestion(q.id,{ topic: e.target.value })} placeholder="Topic" />
                    <select value={q.difficulty||'Medium'} onChange={(e)=>updateQuestion(q.id,{ difficulty: e.target.value as any })} className="p-2 border rounded">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <Textarea value={q.explanation||''} onChange={(e)=>updateQuestion(q.id,{ explanation: e.target.value })} className="h-20" placeholder="Explanation (optional)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} size="lg"><Save className="w-5 h-5 mr-2"/>{saving? 'Saving...':'Save Changes'}</Button>
          <Button type="button" variant="ghost" onClick={()=>{ setQuestions([]); setMsg('Cleared all questions (local)'); }}>Clear All</Button>
          <div className="ml-auto text-sm">{msg}</div>
        </div>
      </form>

      {/* Bulk modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Bulk Upload MCQs</div>
              <div className="flex items-center gap-2">
                <Button onClick={()=>{ setBulkText('Q: Example?\nA) Opt1\nB) Opt2\nC) Opt3\nD) Opt4\nCorrect: A\nExplanation: ...\nTopic: ...\nDifficulty: Medium'); }}>Insert Example</Button>
                <Button variant="ghost" onClick={()=>setBulkModalOpen(false)}>Close</Button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted">Paste text blocks separated by empty line. Supports simple CSV/JSON via Import button on page.</div>
              <Textarea value={bulkText} onChange={(e)=>setBulkText(e.target.value)} className="h-64" />
              <div className="flex gap-2">
                <Button onClick={handleBulkPasteApply}>Parse & Add</Button>
                <Button variant="outline" onClick={()=>{ setBulkText(''); }}>Clear</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/40 overflow-auto">
          <div className="bg-white rounded shadow-lg w-full max-w-4xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Preview: {title || 'Untitled'}</h3>
              <Button variant="ghost" onClick={()=>setPreviewOpen(false)}>Close</Button>
            </div>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="p-3 border rounded">
                  <div className="font-semibold mb-1">{i+1}. {q.question}</div>
                  <ol className="list-decimal pl-6 mb-1">
                    {q.options.map((o, idx) => (
                      <li key={idx} className={o.trim()===q.correctAnswer.trim() ? 'font-semibold text-green-700' : ''}>{o || <em>—</em>}</li>
                    ))}
                  </ol>
                  {q.explanation && <div className="text-sm text-muted">Explanation: {q.explanation}</div>}
                  {q.topic && <div className="text-sm">Topic: {q.topic}</div>}
                  {q.difficulty && <div className="text-sm">Difficulty: {q.difficulty}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
