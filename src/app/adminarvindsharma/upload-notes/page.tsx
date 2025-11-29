"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function UploadNotesPage() {
  const router = useRouter();
  const db = useFirestore();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem("A2G_ADMIN");
    if (s !== "ACTIVE") router.push("/adminarvindsharma");
  }, [router]);

  const handleSubmit = async () => {
    if (!db) {
        setStatus("Firestore is not available.");
        return;
    }
    setStatus(null);
    const adminKey = sessionStorage.getItem("A2G_ADMIN_KEY") || "";
    if (!adminKey) {
      setStatus("Missing admin key in session. Re-verify.");
      return;
    }
    if (!title || !subject) {
      setStatus("Title and Subject required.");
      return;
    }
    
    const notesCollection = collection(db, "notes");
    const noteData = {
        title,
        course,
        year,
        subject,
        content,
        isPremium: !!isPremium,
        createdAt: serverTimestamp(),
        adminKey, // important: used by Firestore rules to validate write
    };

    addDoc(notesCollection, noteData).then(() => {
        setStatus("Saved successfully.");
        setTitle("");
        setCourse("");
        setYear("");
        setSubject("");
        setContent("");
        setIsPremium(false);
    }).catch(async (serverError) => {
      setStatus("Upload failed. Check permissions.");
      const permissionError = new FirestorePermissionError({
        path: notesCollection.path,
        operation: 'create',
        requestResourceData: noteData,
      });
      errorEmitter.emit('permission-error', permissionError);
      console.error(serverError); // Also log original error for more context
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upload Note (admin)</h2>

      <div className="space-y-3">
        <input className="w-full p-3 border rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Course (eg B.Pharm)" value={course} onChange={(e) => setCourse(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Year (eg 4th Year)" value={year} onChange={(e) => setYear(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea className="w-full p-3 border rounded h-48" placeholder="Full content (HTML or text)" value={content} onChange={(e) => setContent(e.target.value)} />

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
          Premium?
        </label>

        <div className="flex gap-3">
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save</button>
          <button onClick={() => router.push("/adminarvindsharma/dashboard")} className="px-4 py-2 border rounded-md">Back</button>
        </div>

        {status && <div className="mt-3 text-sm p-3 bg-secondary rounded-md">{status}</div>}
      </div>
    </div>
  );
}
