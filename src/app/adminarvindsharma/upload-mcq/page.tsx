"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function UploadMCQPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem("A2G_ADMIN");
    if (s !== "ACTIVE") router.push("/adminarvindsharma");
  }, [router]);

  const db = getFirestore(app);

  const handleSubmit = async () => {
    setStatus(null);
    const adminKey = sessionStorage.getItem("A2G_ADMIN_KEY") || "";
    if (!adminKey) {
      setStatus("Missing admin key in session. Re-verify.");
      return;
    }
    if (!title || !subject || !questions) {
      setStatus("Title, Subject, and Questions JSON are required.");
      return;
    }

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions);
      if (!Array.isArray(parsedQuestions)) throw new Error();
    } catch {
      setStatus("Invalid JSON format for questions. It must be an array.");
      return;
    }

    const mcqCollection = collection(db, "mcqSets");
    const mcqData = {
      title,
      course,
      subject,
      questions: parsedQuestions,
      questionCount: parsedQuestions.length,
      isPremium: !!isPremium,
      createdAt: serverTimestamp(),
      adminKey,
    };

    addDoc(mcqCollection, mcqData)
      .then(() => {
        setStatus("MCQ set saved successfully.");
        setTitle("");
        setCourse("");
        setSubject("");
        setQuestions("");
        setIsPremium(false);
      })
      .catch((serverError) => {
        setStatus("Upload failed. Check permissions.");
        const permissionError = new FirestorePermissionError({
          path: mcqCollection.path,
          operation: 'create',
          requestResourceData: mcqData,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error(serverError);
      });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Upload MCQ Set (admin)</h2>

      <div className="space-y-3">
        <input className="w-full p-3 border rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Course (eg B.Pharm)" value={course} onChange={(e) => setCourse(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <textarea
          className="w-full p-3 border rounded h-64 font-mono text-sm"
          placeholder='Paste questions JSON array here. e.g., [{"question":"...", "options":["a","b"], "correctAnswer":"a"}]'
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
        />

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
          Premium?
        </label>

        <div className="flex gap-3">
          <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Save MCQ Set</button>
          <button onClick={() => router.push("/adminarvindsharma/dashboard")} className="px-4 py-2 border rounded-md">Back</button>
        </div>

        {status && <div className="mt-3 text-sm p-3 bg-secondary rounded-md">{status}</div>}
      </div>
    </div>
  );
}
