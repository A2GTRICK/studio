
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp, DocumentData, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

export interface Note {
  id: string;
  title: string;
  course: string;
  year: string;
  subject: string;
  content: string; 
  isPremium: boolean;
  price?: string;
  thumbnail?: string;
  createdAt: Timestamp | Date;
}

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  error: string | null;
  addNote: (noteData: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // We can use auth state to decide when to fetch

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const notesCollection = collection(db, 'notes');
      const q = query(notesCollection, orderBy('createdAt', 'desc'));
      const notesSnapshot = await getDocs(q);
      const notesList = notesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Note));
      setNotes(notesList);
    } catch (err: any) {
      console.error("Error fetching notes:", err);
      setError("Could not retrieve notes from the database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch notes only when user is authenticated
    if (user) {
      fetchNotes();
    }
  }, [user, fetchNotes]);

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, 'notes'), {
      ...noteData,
      createdAt: serverTimestamp(),
    });

    const newNoteForState: Note = {
      ...noteData,
      id: docRef.id,
      createdAt: new Date(),
    };

    setNotes(prevNotes => [newNoteForState, ...prevNotes]);
  };

  const deleteNote = async (noteId: string) => {
    await deleteDoc(doc(db, 'notes', noteId));
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

  const value = { notes, loading, error, addNote, deleteNote };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
