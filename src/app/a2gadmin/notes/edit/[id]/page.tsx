
// src/app/a2gadmin/notes/edit/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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

function autoFormatMarkdown(input: string) {
  if (!input) return "";

  // normalize CRLF and NFKC (keeps unicode consistent)
  let s = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").normalize();

  // split into lines and trim right-side whitespace
  const rawLines = s.split("\n").map((l) => l.replace(/\s+$/g, ""));

  const outLines: string[] = [];
  const push = (ln: string) => outLines.push(ln);

  // helper tests
  const looksLikeNumbered = (ln: string) => /^\s*\d{1,3}\.\s+/.test(ln);
  const looksLikeBullet   = (ln: string) => /^\s*[\*\u2022\u25E6\u25CF\-]\s+/.test(ln);
  const looksLikeAllCaps  = (ln: string) => {
    // treat short-ish ALL CAPS (or starts with letter+dot like "E. Title") as heading
    const t = ln.trim();
    if (!t) return false;
    // ignore lines with many punctuation or digits (likely content)
    if (/[^A-Z0-9\s\.\,&\-\/:()]/.test(t)) return false;
    // length heuristic  > 3 chars and < 80
    return /^[A-Z0-9\.\s\-\&\,\/\(\)]+$/.test(t) && t.replace(/[^A-Z0-9]/g, "").length >= 2 && t.length <= 120;
  };
  const looksLikeTitleCase = (ln: string) => {
    // Title case: many words start with uppercase letter followed by lowercase
    const t = ln.trim();
    if (t.length < 4 || t.length > 120) return false;
    const words = t.split(/\s+/);
    let countTitle = 0;
    for (const w of words) {
      if (/^[A-Z][a-z0-9\-\']+$/.test(w)) countTitle++;
    }
    return countTitle >= Math.max(1, Math.floor(words.length / 2));
  };

  // iterate and transform
  for (let i = 0; i < rawLines.length; i++) {
    let line = rawLines[i];

    // trim overall, but keep intentional leading numbering or bullets
    if (line !== "") line = line.replace(/^\s+/, "");

    // convert common bold headings: **Heading** -> heading
    const boldHeadingMatch = line.match(/^\s*\*\*(.+?)\*\*\s*$/);
    if (boldHeadingMatch) {
      // ensure blank line before heading
      if (outLines.length && outLines[outLines.length - 1].trim() !== "") push("");
      push(`## ${boldHeadingMatch[1].trim()}`);
      // ensure blank line after heading (we'll add later if next non-empty isn't blank)
      continue;
    }

    // lines that end with colon -> heading
    if (/:\s*$/.test(line)) {
      if (outLines.length && outLines[outLines.length - 1].trim() !== "") push("");
      push(`## ${line.replace(/:\s*$/, "").trim()}`);
      continue;
    }

    // lines that look like section titles (E. ... or ALL CAPS) -> heading
    if (looksLikeAllCaps(line) || looksLikeTitleCase(line)) {
      // but avoid turning short list item labels like "ALL THE BEST" when it appears in context as a footer --
      // we use a simple heuristic: if next non-empty line is a list/number or empty, still convert.
      if (outLines.length && outLines[outLines.length - 1].trim() !== "") push("");
      push(`## ${line.trim()}`);
      continue;
    }

    // normalize bullets -> "- "
    if (looksLikeBullet(line)) {
      line = line.replace(/^\s*[\*\u2022\u25E6\u25CF]\s+/, "- ");
      push(line);
      continue;
    }

    // normalize numbered lists: ensure "N. text" with single space
    if (looksLikeNumbered(line)) {
      line = line.replace(/^\s*(\d{1,3})\.\s+/, (_m, n) => `${n}. `);
      push(line);
      continue;
    }

    // keep blank lines but collapse later
    push(line);
  }

  // Post-process: ensure blank line above and below headings and collapse multiple blanks
  const withSpacing: string[] = [];
  for (let i = 0; i < outLines.length; i++) {
    const line = outLines[i];
    const prev = withSpacing.length ? withSpacing[withSpacing.length - 1] : null;
    const next = (() => {
      for (let j = i + 1; j < outLines.length; j++) if (outLines[j].trim() !== "") return outLines[j];
      return null;
    })();

    if (/^##\s+/.test(line)) {
      // ensure blank line before heading
      if (prev !== null && prev.trim() !== "") withSpacing.push("");
      withSpacing.push(line.trim());
      // ensure blank line after heading (but don't add double if next is already blank or heading)
      if (next && !/^##\s+/.test(next) && next.trim() !== "") withSpacing.push("");
      continue;
    }

    // normalize any line with excessive internal spaces
    withSpacing.push(line);
  }

  // collapse runs of >2 blank lines to exactly 2
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

  // final trim of leading/trailing blank lines
  while (collapsed.length && collapsed[0].trim() === "") collapsed.shift();
  while (collapsed.length && collapsed[collapsed.length - 1].trim() === "") collapsed.pop();

  // join and final cleanup: ensure single trailing newline
  return collapsed.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";
}


export default function EditNotePageClient() {
  const params = useParams() as any;
  // next/navigation useParams() may return string or array (edge cases); normalize:
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

  useEffect(() => {
    if (!id) {
      setMsg("Missing note id");
      setLoading(false);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        // API returns { notes: [...] } — find the note by id
        const res = await fetch(`/api/a2gadmin/notes?id=${encodeURIComponent(id)}`, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Failed to load: ${res.status} ${txt}`);
        }
        const payload = await res.json().catch(() => ({}));
        let n: NoteShape | undefined;

        if (Array.isArray(payload?.notes)) {
          n = payload.notes.find((x: any) => x.id === id) ?? payload.notes[0];
        } else if (payload?.note) {
          n = payload.note;
        } else if (payload?.id) {
          n = payload;
        }

        if (!n) {
          // fallback: try fetch single doc via client firestore? (we avoid that)
          throw new Error("Note not found from API");
        }

        if (!mounted) return;
        // normalize a few fields
        setNote({
          id: n.id,
          title: n.title ?? "",
          subject: n.subject ?? "",
          course: n.course ?? "",
          year: n.year ?? "",
          topic: n.topic ?? "",
          isPremium: !!n.isPremium,
          content: n.content ?? n.notes ?? "",
          attachments: Array.isArray(n.attachments) ? n.attachments : [],
          ...n,
        });
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

      // send FormData to your server-side API (PUT accepted)
      const res = await fetch(`/api/a2gadmin/notes?id=${encodeURIComponent(id)}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`Save failed: ${res.status} ${body}`);
      }

      setMsg("Note updated successfully.");
      // optional: refresh list or navigate back
      // router.refresh();
    } catch (err: any) {
      console.error("Save error:", err);
      setMsg(String(err.message ?? "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  function runAutoFormat() {
    const formatted = autoFormatMarkdown(note.content || "");
    setNote({ ...note, content: formatted });
    setMsg("Auto-format applied (non-AI). Please review before saving.");
  }


  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin w-8 h-8" /></div>;

  return (
    <form onSubmit={saveNote} className="text-foreground max-w-5xl mx-auto space-y-6 p-4">
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

      <div>
        <div className="flex items-center justify-between mb-2">
            <label className="block font-semibold text-sm">Content</label>
             <Button type="button" onClick={runAutoFormat} variant="outline" size="sm">
              Auto-format (non-AI)
            </Button>
        </div>
        <div data-color-mode="dark">
          <MDEditor value={note.content ?? ""} onChange={(v = "") => setNote({ ...note, content: String(v) })} height={400} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        <button type="button" className="px-3 py-2 border rounded" onClick={() => router.back()}>
          Cancel
        </button>

        {msg && <span className="text-sm text-foreground/80">{msg}</span>}
      </div>
    </form>
  );
}
