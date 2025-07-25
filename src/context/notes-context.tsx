
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp, DocumentData, Timestamp, getDoc } from 'firebase/firestore';
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
    } else {
      // If user logs out, clear notes and stop loading
      setNotes([]);
      setLoading(false);
    }
  }, [user, fetchNotes]);

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    // 1. Save the new note to Firestore first.
    const docRef = await addDoc(collection(db, 'notes'), {
      ...noteData,
      createdAt: serverTimestamp(),
    });

    // 2. Fetch the newly created document from Firestore to get the server-generated timestamp.
    const newDocSnapshot = await getDoc(docRef);
    if (newDocSnapshot.exists()) {
        const newNote = { ...newDocSnapshot.data(), id: newDocSnapshot.id } as Note;
        
        // 3. Update the local state with the confirmed data from the database.
        setNotes(prevNotes => [newNote, ...prevNotes].sort((a, b) => {
            const dateA = (a.createdAt as Timestamp)?.toDate?.() || new Date(0);
            const dateB = (b.createdAt as Timestamp)?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
        }));
    } else {
        // If for some reason the doc doesn't exist, refetch all notes as a fallback.
        console.warn("Could not find newly created note, refetching all notes.");
        await fetchNotes();
    }
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
