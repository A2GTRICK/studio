
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp, DocumentData, Timestamp, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
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
  createdAt: Date;
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
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait until authentication is resolved before fetching notes.
    if (authLoading) {
      setLoading(true);
      return;
    }

    // If no user is logged in, there are no notes to fetch.
    if (!user) {
        setNotes([]);
        setLoading(false);
        return;
    }

    // User is authenticated. Set up the real-time listener.
    // This `onSnapshot` listener is the key to why you don't need to republish.
    // It automatically detects any changes (add, edit, delete) in the Firestore 'notes' collection
    // and updates the app for all users in real-time.
    setLoading(true);
    const notesCollection = collection(db, 'notes');
    const q = query(notesCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notesList = snapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.createdAt as Timestamp;
            return { 
                ...data, 
                id: doc.id,
                // Convert Firestore Timestamp to a serializable Date object
                createdAt: timestamp ? timestamp.toDate() : new Date() 
            } as Note;
        });
        setNotes(notesList);
        setLoading(false);
    }, (err) => {
        console.error("Error fetching notes with onSnapshot:", err);
        setError("Could not retrieve notes from the database.");
        setLoading(false);
    });

    // Cleanup subscription on unmount to prevent memory leaks
    return () => unsubscribe();
  }, [user, authLoading]);

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
        const data = newDocSnapshot.data();
        const timestamp = data.createdAt as Timestamp;
        // Return the newly created note object with a converted Date.
        return { 
            id: newDocSnapshot.id, 
            ...data,
            createdAt: timestamp ? timestamp.toDate() : new Date()
        } as Note;
      } else {
        throw new Error("Could not retrieve saved note from database.");
      }
    } catch (err) {
      console.error("Error adding note to Firestore:", err);
      throw err;
    }
  };

  const updateNote = async (noteId: string, noteData: Partial<Note>) => {
    const noteRef = doc(db, 'notes', noteId);
    
    const dataToUpdate: { [key: string]: any } = {};
    Object.entries(noteData).forEach(([key, value]) => {
      if (value !== undefined) {
        dataToUpdate[key] = value;
      }
    });

    // If a note is made not-premium, remove its price.
    if (dataToUpdate.isPremium === false) {
        dataToUpdate.price = null;
    }
    
    // If the thumbnail URL is cleared, remove it from the database.
    if (dataToUpdate.thumbnail === '') {
        dataToUpdate.thumbnail = null;
    }


    try {
        await updateDoc(noteRef, dataToUpdate);
    } catch (err) {
        console.error("Error updating note:", err);
        throw err;
    }
  };


  const deleteNote = async (noteId: string) => {
    try {
        await deleteDoc(doc(db, 'notes', noteId));
    } catch (err) {
        console.error("Error deleting note:", err);
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
