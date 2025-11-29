"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "@/firebase";

interface Note {
  id: string;
  title: string;
  subject: string;
  course: string;
  year: string;
  content: string;
  isPremium?: boolean;
  createdAt?: any;
}

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  reload: () => void;
}

const NotesContext = createContext<NotesContextType>({
  notes: [],
  loading: true,
  reload: () => {},
});

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = () => {
    setLoading(true);

    try {
      const ref = collection(db, "notes");
      const q = query(ref, orderBy("createdAt", "desc"));

      onSnapshot(q, (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Note[];

        setNotes(list);
        setLoading(false);
      });
    } catch (err) {
      console.error("Notes load error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <NotesContext.Provider value={{ notes, loading, reload: loadNotes }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}
