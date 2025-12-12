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
  let s = input || "";
  s = s.replace(/\r\n/g, "\n");
  s = s.replace(/^\s*\*\*(.+?)\*\*\s*$/gm, (_m, g1) => `## ${g1.trim()}`);
  s = s.replace(/^\s*([A-Z0-9][A-Za-z0-9\s\-\u00A0]{3,})\s*:\s*$/gm, (_m, g1) => `## ${g1.trim()}`);
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.replace(/^\s*[\*\u2022]\s+/gm, "- ");
  s = s.split("\n").map((l) => l.replace(/\s+$/g, "")).join("\n");
  return s;
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
