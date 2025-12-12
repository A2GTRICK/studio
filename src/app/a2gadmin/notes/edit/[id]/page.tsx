"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, FileText, Repeat, Eye, Download, Trash } from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// ----------------- Types -----------------

type NoteShape = {
  id?: string;
  title?: string;
  subject?: string;
  course?: string;
  year?: string;
  topic?: string;
  isPremium?: boolean;
  content?: string;
  attachments?: string[];
  [k: string]: any;
};

// -------------- Smart formatter (offline, deterministic) --------------
function autoFormatMarkdown(input: string) {
  if (!input) return "";

  // normalize newlines and unicode
  let s = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").normalize();

  // split into lines and trim right-side whitespace
  const rawLines = s.split("\n").map((l) => l.replace(/\s+$/g, ""));

  const outLines: string[] = [];
  const push = (ln: string) => outLines.push(ln);

  const looksLikeNumbered = (ln: string) => /^\s*\d{1,3}\.\s+/.test(ln);
  const looksLikeBullet = (ln: string) => /^\s*[\*\u2022\u25E6\u25CF\-]\s+/.test(ln);
  const looksLikeAllCaps = (ln: string) => {
    const t = ln.trim();
    if (!t) return false;
    if (/[^A-Z0-9\s\.\,\&\-\/:\(\)]/.test(t)) return false;
    return /^[A-Z0-9\.\s\-\&\,\/\(\)]+$/.test(t) && t.replace(/[^A-Z0-9]/g, "").length >= 2 && t.length <= 120;
  };
  const looksLikeTitleCase = (ln: string) => {
    const t = ln.trim();
    if (t.length < 4 || t.length > 120) return false;
    const words = t.split(/\s+/);
    let countTitle = 0;
    for (const w of words) {
      if (/^[A-Z][a-z0-9\-']+$/.test(w)) countTitle++;
    }
    return countTitle >= Math.max(1, Math.floor(words.length / 2));
  };

  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i];
    if (line !== "") line = line.replace(/^\s+/, "");

    // bold-only lines -> heading
    const boldHeadingMatch = line.match(/^\s*\*\*(.+?)\*\*\s*$/);
    if (boldHeadingMatch) {
      if (outLines.length && outLines[outLines.length - 1].trim() !== "") push("");
      push(`## ${boldHeadingMatch[1].trim()}`);
      continue;
    }

    // lines that end with colon -> heading
    if (/:\s*$/.test(line)) {
      if (outLines.length && outLines[outLines.length - 1].trim() !== "") push("");
      push(`## ${line.replace(/:\s*$/, "").trim()}`);
      continue;
    }

    // capitalized/title heuristics
    if (looksLikeAllCaps(line) || looksLikeTitleCase(line)) {
      if (outLines.length && outLines[outLines.length - 1].trim() !== "") push("");
      push(`## ${line.trim()}`);
      continue;
    }

    // bullets
    if (looksLikeBullet(line)) {
      line = line.replace(/^\s*[\*\u2022\u25E6\u25CF]\s+/, "- ");
      push(line);
      continue;
    }

    // numbered lists
    if (looksLikeNumbered(line)) {
      line = line.replace(/^\s*(\d{1,3})\.\s+/, (_m, n) => `${n}. `);
      push(line);
      continue;
    }

    push(line);
  }

  // ensure spacing around headings and collapse multiple blanks
  const withSpacing: string[] = [];
  for (let i = 0; i < outLines.length; i++) {
    const line = outLines[i];
    const prev = withSpacing.length ? withSpacing[withSpacing.length - 1] : null;
    const next = (() => {
      for (let j = i + 1; j < outLines.length; j++) if (outLines[j].trim() !== "") return outLines[j];
      return null;
    })();

    if (/^##\s+/.test(line)) {
      if (prev !== null && prev.trim() !== "") withSpacing.push("");
      withSpacing.push(line.trim());
      if (next && !/^##\s+/.test(next) && next.trim() !== "") withSpacing.push("");
      continue;
    }
    withSpacing.push(line);
  }

  let collapsed: string[] = [];
  let blankRun = 0;
  for (const ln of withSpacing) {
    if (ln.trim() === "") {
      blankRun++;
      if (blankRun <= 2) collapsed.push("");
    } else {
      blankRun = 0;
      collapsed.push(ln);
    }
  }

  while (collapsed.length && collapsed[0].trim() === "") collapsed.shift();
  while (collapsed.length && collapsed[collapsed.length - 1].trim() === "") collapsed.pop();

  return collapsed.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}

// Generate TOC from formatted markdown (only lines starting with ## )
function generateTOC(markdown: string) {
  const lines = markdown.split(/\n/);
  const toc: { text: string; anchor: string }[] = [];
  for (const ln of lines) {
    const m = ln.match(/^##\s+(.+)$/);
    if (m) {
      const text = m[1].trim();
      const anchor = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      toc.push({ text, anchor });
    }
  }
  return toc;
}

// simple diff lines (returns array of {type, left, right})
function diffLines(left: string, right: string) {
  const la = left.split(/\n/);
  const ra = right.split(/\n/);
  const max = Math.max(la.length, ra.length);
  const out: { type: "equal" | "replace" | "left-only" | "right-only"; left?: string; right?: string }[] = [];
  for (let i = 0; i < max; i++) {
    const l = la[i] ?? "";
    const r = ra[i] ?? "";
    if (l === r) out.push({ type: "equal", left: l, right: r });
    else if (l && r) out.push({ type: "replace", left: l, right: r });
    else if (l && !r) out.push({ type: "left-only", left: l });
    else out.push({ type: "right-only", right: r });
  }
  return out;
}

// ----------------- Minimal markdown -> HTML renderer (keeps work offline) -----------------
function renderMarkdownToHtml(md: string) {
  if (!md) return "";
  // escape
  let html = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // headings
  html = html.replace(/^##\s+(.+)$/gm, (_, h) => {
    const id = String(h).toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    return `<h2 id="${id}">${h}</h2>`;
  });

  // bold
  html = html.replace(/\*\*(.+?)\*\*/g, (_, b) => `<strong>${b}</strong>`);

  // inline code
  html = html.replace(/`([^`]+?)`/g, (_, c) => `<code>${c}</code>`);

  // links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (_, t, u) => `<a href="${u}" rel="noreferrer noopener">${t}</a>`);

  // bullets -> <li>
  html = html.replace(/^\s*-\s+(.+)$/gm, (_, t) => `<li>${t}</li>`);
  html = html.replace(/(<li>.*?<\/li>\s*)+/gms, (m) => `<ul>${m}</ul>`);

  // numbered
  html = html.replace(/^(\d+)\.\s+(.+)$/gm, (_, n, t) => `<li>${t}</li>`);
  html = html.replace(/(<li>.*?<\/li>\s*)+/gms, (m) => `<ol>${m}</ol>`);

  // paragraphs: any line not wrapped
  const lines = html.split(/\n/).map((l) => l.trim()).filter(Boolean);
  html = lines.join("\n").replace(/(<h2>.*?<\/h2>|<ul>.*?<\/ul>|<ol>.*?<\/ol>)/gms, (m) => m + "\n");
  return html;
}

// ----------------- Component -----------------
export default function EditNotePageClient() {
  const params = useParams() as any;
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [note, setNote] = useState<NoteShape>({
    title: "",
    subject: "",
    course: "",
    year: "",
    topic: "",
    isPremium: false,
    content: "",
  });

  // version history (in-memory)
  const [history, setHistory] = useState<string[]>([]);

  // diff modal
  const [diffOpen, setDiffOpen] = useState(false);
  const [formattedPreview, setFormattedPreview] = useState("");

  // reader preview mode
  const [readerOpen, setReaderOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement | null>(null);

  // Local storage draft key
  const draftKey = `a2g:note:draft:${id}`;

  useEffect(() => {
    if (!id) {
      setMsg("Missing note id");
      setLoading(false);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/a2gadmin/notes?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Failed to load: ${res.status} ${txt}`);
        }
        const payload = await res.json().catch(() => ({}));
        let n: NoteShape | undefined;
        if (Array.isArray(payload?.notes)) n = payload.notes.find((x: any) => x.id === id) ?? payload.notes[0];
        else if (payload?.note) n = payload.note;
        else if (payload?.id) n = payload;
        if (!n) throw new Error("Note not found from API");
        if (!mounted) return;

        const incomingContent = n.content ?? n.notes ?? "";
        // if a draft exists in localStorage, prefer it (admin might have unsaved work)
        const local = typeof window !== 'undefined' ? localStorage.getItem(draftKey) : null;
        const contentToUse = local ?? incomingContent;

        setNote({
          id: n.id,
          title: n.title ?? "",
          subject: n.subject ?? "",
          course: n.course ?? "",
          year: n.year ?? "",
          topic: n.topic ?? "",
          isPremium: !!n.isPremium,
          content: contentToUse,
          attachments: Array.isArray(n.attachments) ? n.attachments : [],
          ...n,
        });
        setHistory([(incomingContent ?? "")]);
        setMsg(null);
      } catch (err: any) {
        console.error("Load note error:", err);
        if (mounted) setMsg(String(err.message ?? "Network error loading note."));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // autosave draft locally (lightweight)
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, note.content ?? "");
      } catch (e) {
        // ignore storage errors
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [note.content, id]);

  async function saveNote(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      if (!id) throw new Error("Missing id");
      const formData = new FormData();
      formData.append("title", note.title ?? "");
      formData.append("subject", note.subject ?? "");
      formData.append("course", note.course ?? "");
      formData.append("year", note.year ?? "");
      formData.append("topic", note.topic ?? "");
      formData.append("isPremium", String(!!note.isPremium));
      formData.append("content", note.content ?? "");
      const res = await fetch(`/api/a2gadmin/notes?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Save failed: ${res.status} ${body}`);
      }
      setMsg("Note updated successfully.");
      setHistory((h) => [note.content ?? "", ...h].slice(0, 20));
      // remove draft on successful save
      try { localStorage.removeItem(draftKey); } catch (e) {}
    } catch (err: any) {
      console.error("Save error:", err);
      setMsg(String(err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  // Manual apply auto-format (Option C: formatting only via button)
  function applyAutoFormat() {
    const formatted = autoFormatMarkdown(note.content || "");
    setFormattedPreview(formatted);
    setDiffOpen(true);
  }

  function acceptFormatted() {
    if (formattedPreview) {
      setHistory((h) => [note.content ?? "", ...h].slice(0, 20));
      setNote({ ...note, content: formattedPreview });
      setMsg("Auto-format accepted. Please save to persist.");
    }
    setFormattedPreview("");
    setDiffOpen(false);
  }
  function rejectFormatted() {
    setFormattedPreview("");
    setDiffOpen(false);
  }

  function exportMarkdown() {
    const blob = new Blob([note.content ?? ""], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(note.title || "note").replace(/[^a-z0-9\-]/gi, "_").slice(0, 60)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportPlainText() {
    const blob = new Blob([stripMarkdown(note.content ?? "")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(note.title || "note").replace(/[^a-z0-9\-]/gi, "_").slice(0, 60)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function stripMarkdown(md: string) {
    return md
      .replace(/^##\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/\n{2,}/g, "\n\n")
      .replace(/^[\s>*-]+/gm, "")
      .trim();
  }

  function undoVersion() {
    const [latest, ...rest] = history;
    if (!latest) return;
    setNote({ ...note, content: latest });
    setHistory(rest);
    setMsg("Reverted to previous version (in-memory). Save to persist.");
  }

  const toc = generateTOC(note.content ?? "");

  if (loading) return (
    <div className="p-6 text-center"><Loader2 className="animate-spin w-8 h-8" /></div>
  );

  return (
    <form onSubmit={saveNote} className="text-foreground max-w-7xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Note</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Input value={note.title ?? ""} onChange={(e) => setNote({ ...note, title: e.target.value })} placeholder="Title" required />
        <Input value={note.subject ?? ""} onChange={(e) => setNote({ ...note, subject: e.target.value })} placeholder="Subject" />
        <Input value={note.course ?? ""} onChange={(e) => setNote({ ...note, course: e.target.value })} placeholder="Course" />
        <Input value={note.year ?? ""} onChange={(e) => setNote({ ...note, year: e.target.value })} placeholder="Year" />
      </div>

      <div className="mb-4">
        <Input value={note.topic ?? ""} onChange={(e) => setNote({ ...note, topic: e.target.value })} placeholder="Topic" />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={!!note.isPremium}
          onChange={(e) => setNote({ ...note, isPremium: e.target.checked })}
        />
        <span className="font-semibold text-sm">Mark as Premium</span>
      </label>

      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <label className="block font-semibold text-sm">Content</label>
            <div className="flex items-center gap-2">
              {/* Option C: manual button only for auto-format */}
              <Button type="button" variant="outline" size="sm" onClick={() => applyAutoFormat()}>
                Auto-format (non-AI)
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setReaderOpen(true)}>
                <Eye className="w-4 h-4 mr-2" /> Preview
              </Button>
            </div>
          </div>

          <div data-color-mode="dark">
            <MDEditor value={note.content ?? ""} onChange={(v = "") => setNote({ ...note, content: String(v) })} height={520} />
          </div>
        </div>

        <aside style={{ width: 320 }} className="hidden md:block sticky top-6">
          <div className="p-4 border rounded bg-white shadow-sm">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Button type="button" onClick={() => { const f = autoFormatMarkdown(note.content||""); setNote({ ...note, content: f }); setMsg('Applied auto-format.'); setHistory(h=>[note.content||"",...h].slice(0,20)); }}>
                <FileText className="w-4 h-4 mr-2" /> Apply Format
              </Button>
              <Button type="button" onClick={exportMarkdown}>
                <Download className="w-4 h-4 mr-2" /> Export MD
              </Button>
              <Button type="button" onClick={exportPlainText}>
                <Download className="w-4 h-4 mr-2" /> Export TXT
              </Button>
              <Button type="button" onClick={() => { setNote({ ...note, content: note.content || "" }); setHistory(h=>[note.content||"",...h].slice(0,20)); }}>
                <Repeat className="w-4 h-4 mr-2" /> Save snapshot (local)
              </Button>
              <Button type="button" onClick={undoVersion}>
                Undo (last)
              </Button>
              <Button type="button" variant="destructive" onClick={() => { if (confirm('Clear content? This will remove local draft and editor content.')) { setNote({ ...note, content: '' }); try { localStorage.removeItem(draftKey); } catch(e){} setMsg('Content cleared (local)'); } }}>
                <Trash className="w-4 h-4 mr-2" /> Clear
              </Button>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold">Table of Contents</h4>
              <div className="mt-2 max-h-64 overflow-auto text-sm">
                {toc.length === 0 ? <div className="text-muted">No headings found.</div> : (
                  <ol className="list-decimal list-inside">
                    {toc.map((t) => <li key={t.anchor}><a href={`#${t.anchor}`} onClick={(e) => { e.preventDefault(); const el = document.getElementById(t.anchor); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{t.text}</a></li>)}
                  </ol>
                )}
              </div>
            </div>

          </div>
        </aside>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        <button type="button" className="px-3 py-2 border rounded" onClick={() => router.back()}>
          Cancel
        </button>

        <div className="ml-auto text-sm text-foreground/80">{msg}</div>
      </div>

      {/* Diff Modal - simple */}
      {diffOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch p-8 bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-6xl mx-auto overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">Auto-format preview</div>
              <div className="flex items-center gap-2">
                <Button type="button" onClick={acceptFormatted}>Accept</Button>
                <Button type="button" variant="ghost" onClick={rejectFormatted}>Reject</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4" style={{ minHeight: 360 }}>
              <div className="border rounded p-2 overflow-auto">
                <div className="text-xs font-semibold mb-2">Original</div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{note.content}</pre>
              </div>
              <div className="border rounded p-2 overflow-auto bg-slate-50">
                <div className="text-xs font-semibold mb-2">Formatted</div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{formattedPreview}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader preview modal */}
      {readerOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch p-8 bg-black/40">
          <div className="bg-white rounded shadow-lg w-full max-w-5xl mx-auto overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Reader preview</div>
              <Button type="button" variant="ghost" onClick={() => setReaderOpen(false)}>Close</Button>
            </div>
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(note.content || "") }} />
            </div>
          </div>
        </div>
      )}

    </form>
  );
}
