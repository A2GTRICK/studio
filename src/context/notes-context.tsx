
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
  
    // --- OPTIMISTIC UPDATE ---
    // Create a temporary note to display instantly.
    const tempId = `temp_${Date.now()}`;
    const tempNote: Note = {
      ...noteData,
      id: tempId,
      createdAt: new Date(),
    };
  
    // Add the temporary note to the UI.
    setNotes(prevNotes => [tempNote, ...prevNotes].sort((a, b) => {
      const dateA = (a.createdAt as Timestamp)?.toDate?.() || new Date(a.createdAt);
      const dateB = (b.createdAt as Timestamp)?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    }));
  
    try {
      // --- PERMANENT SAVE ---
      // Create a clean object with only the data Firestore needs.
      const noteToSave: { [key: string]: any } = {
        title: noteData.title,
        course: noteData.course,
        year: noteData.year,
        subject: noteData.subject,
        content: noteData.content,
        isPremium: noteData.isPremium,
        createdAt: serverTimestamp(),
      };
  
      // Only add optional fields if they have a value.
      if (noteData.price) {
        noteToSave.price = noteData.price;
      }
      if (noteData.thumbnail) {
        noteToSave.thumbnail = noteData.thumbnail;
      }
      
      // Save to Firestore.
      const docRef = await addDoc(collection(db, 'notes'), noteToSave);
      const newDocSnapshot = await getDoc(docRef);
  
      if (newDocSnapshot.exists()) {
        const newNote = { ...newDocSnapshot.data(), id: newDocSnapshot.id } as Note;
        // Replace the temporary note with the real one from the database.
        setNotes(prevNotes => 
          prevNotes.map(note => (note.id === tempId ? newNote : note))
                   .sort((a, b) => {
                      const dateA = (a.createdAt as Timestamp)?.toDate?.() || new Date(a.createdAt);
                      const dateB = (b.createdAt as Timestamp)?.toDate?.() || new Date(b.createdAt);
                      return dateB.getTime() - dateA.getTime();
                    })
        );
      } else {
        throw new Error("Could not retrieve saved note from database.");
      }
    } catch (err) {
      console.error("Error adding note, reverting optimistic update:", err);
      // If saving fails, remove the temporary note from the UI.
      setNotes(prevNotes => prevNotes.filter(note => note.id !== tempId));
      throw err; // Re-throw the error to be caught by the component.
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
