
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
  refresh: () => void;
};

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<NoteStub[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = () => {
    setLoading(true);
    const notesQuery = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(notesQuery, 
      (snap) => {
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
        setLoading(false);
      },
      (error) => {
        console.error("loadNotes error", error);
        
        const permissionError = new FirestorePermissionError({
          path: 'notes',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        setNotes([]);
        setLoading(false);
      }
    );
    return unsubscribe;
  };

  useEffect(() => {
    const unsub = loadNotes();
    return () => unsub();
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
