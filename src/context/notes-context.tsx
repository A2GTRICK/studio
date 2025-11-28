"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NoteStub = {
  id: string;
  title: string;
  short?: string;
  content?: string;
  course?: string;
  year?: string;
  subject?: string;
  createdAt?: string;
};

type NotesContextValue = {
  notes: NoteStub[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<NoteStub[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const items: NoteStub[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          title: data.title || "Untitled",
          short: data.short || data.description || data.summary || "",
          content: data.content || "",
          course: data.course || "General",
          year: data.year || "",
          subject: data.subject || "",
          createdAt: data.createdAt ? data.createdAt.toDate?.()?.toISOString?.() || String(data.createdAt) : "",
        };
      });
      setNotes(items);
    } catch (err) {
      console.error("loadNotes error", err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    // note: no realtime listener for Lite mode; can add onSnapshot later
  }, []);

  return (
    <NotesContext.Provider value={{ notes, loading, refresh: loadNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside NotesProvider");
  return ctx;
}