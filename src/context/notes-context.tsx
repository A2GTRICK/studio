
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
    // Optimistic UI Update:
    // 1. Create a temporary note object and add it to the local state immediately.
    const tempId = `temp_${Date.now()}`;
    const tempNote: Note = {
        ...noteData,
        id: tempId,
        createdAt: new Date(), // Use local time for now
    };

    setNotes(prevNotes => [tempNote, ...prevNotes].sort((a, b) => {
        const dateA = (a.createdAt as Timestamp)?.toDate?.() || new Date(a.createdAt);
        const dateB = (b.createdAt as Timestamp)?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    }));

    try {
        // 2. Save the new note to Firestore in the background.
        const docRef = await addDoc(collection(db, 'notes'), {
            ...noteData,
            createdAt: serverTimestamp(),
        });

        // 3. Once saved, fetch the real note data from Firestore.
        const newDocSnapshot = await getDoc(docRef);
        if (newDocSnapshot.exists()) {
            const newNote = { ...newDocSnapshot.data(), id: newDocSnapshot.id } as Note;
            
            // 4. Replace the temporary note in the local state with the permanent one from the database.
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
        // If the save fails, remove the temporary note from the list.
        setNotes(prevNotes => prevNotes.filter(note => note.id !== tempId));
        // Optionally, show an error toast to the user.
        throw err; // Re-throw error to be caught by the calling component
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
