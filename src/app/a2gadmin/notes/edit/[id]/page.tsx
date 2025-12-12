"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save } from "lucide-react";
import { db } from "@/firebase/config";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// Load MDEditor CLIENT-SIDE ONLY
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditNotePage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState<any>({
    title: "",
    subject: "",
    course: "",
    year: "",
    topic: "",
    isPremium: false,
    content: "",
  });

  // ----------------------------------------------------
  // LOAD NOTE DETAILS
  // ----------------------------------------------------
  useEffect(() => {
    if (!id) return;

    async function loadNote() {
      try {
        const docRef = doc(db, 'notes', Array.isArray(id) ? id[0] : id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setNote({
            title: data.title || "",
            subject: data.subject || "",
            course: data.course || "",
            year: data.year || "",
            topic: data.topic || "",
            isPremium: data.isPremium || false,
            content: data.content || "",
          });
        } else {
            setMsg("Failed to load note");
        }
      } catch (err) {
        console.error("Failed to load note", err);
        setMsg("Network error loading note.");
      }

      setLoading(false);
    }

    loadNote();
  }, [id]);

  // ----------------------------------------------------
  // SAVE/UPDATE NOTE
  // ----------------------------------------------------
  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    
    try {
        const docRef = doc(db, 'notes', Array.isArray(id) ? id[0] : id);
        await updateDoc(docRef, {
            ...note,
            updatedAt: serverTimestamp(),
        });
        setMsg("Note updated successfully!");

    } catch (err) {
        setMsg("A network error occurred.");
    } finally {
        setSaving(false);
    }
  }
  
  if (loading) return <div className="p-6 text-center"><Loader2 className="animate-spin w-8 h-8" /></div>;

  return (
    <form onSubmit={saveNote} className="text-white max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Note</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Input className="bg-white/10" value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} placeholder="Title" required />
        <Input className="bg-white/10" value={note.subject} onChange={(e) => setNote({ ...note, subject: e.target.value })} placeholder="Subject" />
        <Input className="bg-white/10" value={note.course} onChange={(e) => setNote({ ...note, course: e.target.value })} placeholder="Course" />
        <Input className="bg-white/10" value={note.year} onChange={(e) => setNote({ ...note, year: e.target.value })} placeholder="Year" />
      </div>

       <div className="mb-4">
          <Input className="bg-white/10" value={note.topic} onChange={(e) => setNote({ ...note, topic: e.target.value })} placeholder="Topic" />
       </div>


      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={note.isPremium}
          onChange={(e) =>
            setNote({ ...note, isPremium: e.target.checked })
          }
        />
        <span className="font-semibold">Mark as Premium</span>
      </label>

      {/* Content Editor */}
      <div>
        <label className="block mb-2 font-semibold">Content</label>
        <div className="bg-white/5 p-2 rounded" data-color-mode="dark">
            <MDEditor
            value={note.content}
            onChange={(v = "") => setNote({ ...note, content: String(v) })}
            height={400}
            />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
            {saving ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? "Saving..." : "Save Changes"}
        </Button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </form>
  );
}
