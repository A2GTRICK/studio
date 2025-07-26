
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp, DocumentData, Timestamp, getDoc, updateDoc } from 'firebase/firestore';
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
  addNote: (noteData: Omit<Note, 'id' | 'createdAt'>) => Promise<Note | null>;
  deleteNote: (noteId: string) => Promise<void>;
  updateNote: (noteId: string, noteData: Partial<Note>) => Promise<void>;
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

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt'>): Promise<Note | null> => {
    if (!db) {
      throw new Error("Firestore is not initialized.");
    }
  
    const noteToSave: { [key: string]: any } = {
      title: noteData.title,
      course: noteData.course,
      year: noteData.year,
      subject: noteData.subject,
      content: noteData.content,
      isPremium: noteData.isPremium,
      createdAt: serverTimestamp(),
    };
  
    if (noteData.isPremium && noteData.price) {
      noteToSave.price = noteData.price;
    }
    if (noteData.thumbnail && noteData.thumbnail.trim() !== '') {
      noteToSave.thumbnail = noteData.thumbnail;
    }

    try {
      const docRef = await addDoc(collection(db, 'notes'), noteToSave);
      const newDocSnapshot = await getDoc(docRef);
      if (newDocSnapshot.exists()) {
        const newNote = { ...newDocSnapshot.data(), id: newDocSnapshot.id } as Note;
        // The serverTimestamp is resolved on the server, so we get the correct date here
        // We prepend the new note to our local state
        setNotes(prevNotes => [newNote, ...prevNotes]);
        return newNote; // Return the created note object on success
      } else {
        throw new Error("Could not retrieve saved note from database.");
      }
    } catch (err) {
      console.error("Error adding note to Firestore:", err);
      throw err; // Re-throw the error to be caught by the calling component
    }
  };

  const updateNote = async (noteId: string, noteData: Partial<Note>) => {
    const noteRef = doc(db, 'notes', noteId);
    
    // Prepare data for Firestore, handling undefined values
    const dataToUpdate: { [key: string]: any } = {};
    Object.entries(noteData).forEach(([key, value]) => {
      if (value !== undefined) {
        dataToUpdate[key] = value;
      }
    });

    // Ensure price is set to null if note is not premium
    if (dataToUpdate.isPremium === false) {
        dataToUpdate.price = null;
    }

    if (dataToUpdate.thumbnail === '') {
        dataToUpdate.thumbnail = null;
    }


    try {
        await updateDoc(noteRef, dataToUpdate);
        // Optimistically update UI or refetch
        setNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === noteId ? { ...note, ...dataToUpdate } : note
            )
        );
    } catch (err) {
        console.error("Error updating note:", err);
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

  const value = { notes, loading, error, addNote, deleteNote, updateNote };

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
