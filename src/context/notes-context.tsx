
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
  const { user } = useAuth();

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
    if (user) {
      fetchNotes();
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [user, fetchNotes]);

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt'>) => {
    if (!db) {
      throw new Error("Firestore is not initialized.");
    }
  
    // --- Definitive Fix for Vanishing Notes ---
    // 1. Create a clean object for Firestore with only required fields.
    const noteToSave: { [key: string]: any } = {
      title: noteData.title,
      course: noteData.course,
      year: noteData.year,
      subject: noteData.subject,
      content: noteData.content,
      isPremium: noteData.isPremium,
      createdAt: serverTimestamp(),
    };
  
    // 2. Conditionally add optional fields ONLY if they have a valid value.
    // This prevents sending `undefined` or empty strings to Firestore.
    if (noteData.isPremium && noteData.price) {
      noteToSave.price = noteData.price;
    }
    if (noteData.thumbnail && noteData.thumbnail.trim() !== '') {
      noteToSave.thumbnail = noteData.thumbnail;
    }
    // --- End of Fix ---

    try {
      const docRef = await addDoc(collection(db, 'notes'), noteToSave);
      
      // Fetch the newly created document to get the server-generated timestamp
      const newDocSnapshot = await getDoc(docRef);
      if (newDocSnapshot.exists()) {
        const newNote = { ...newDocSnapshot.data(), id: newDocSnapshot.id } as Note;
        // Update the local state with the permanent, saved note
        setNotes(prevNotes => 
          [newNote, ...prevNotes].sort((a, b) => {
             const dateA = (a.createdAt as Timestamp)?.toDate?.() || new Date(a.createdAt);
             const dateB = (b.createdAt as Timestamp)?.toDate?.() || new Date(b.createdAt);
             return dateB.getTime() - dateA.getTime();
           })
        );
      } else {
        // This case is unlikely but handled for safety
        throw new Error("Could not retrieve saved note from database.");
      }
    } catch (err) {
      console.error("Error adding note to Firestore:", err);
      // If saving fails, we re-throw the error to be caught by the UI.
      // The optimistic update is avoided to prevent confusion.
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    const notesBeforeDelete = notes;
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));

    try {
        await deleteDoc(doc(db, 'notes', noteId));
    } catch (err) {
        console.error("Error deleting note, reverting optimistic update:", err);
        setNotes(notesBeforeDelete);
        throw err;
    }
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

    