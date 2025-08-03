
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { GenerateNotesInput } from '@/ai/flows/generate-notes';

export interface Note extends GenerateNotesInput {
    id?: string;
    notes: string;
    createdAt: Date;
}

const notesCollection = collection(db, 'notes');

// Type guard to check if a Firestore document has the 'createdAt' field as a Timestamp
function isNoteData(docData: DocumentData): docData is { createdAt: import('firebase/firestore').Timestamp } & Omit<Note, 'createdAt'> {
    return docData.createdAt && typeof docData.createdAt.toDate === 'function';
}


export async function addNote(note: Omit<Note, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(notesCollection, {
        ...note,
        createdAt: serverTimestamp() 
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Could not save note to database.");
  }
}

export async function getNotes(): Promise<Note[]> {
    try {
        const querySnapshot = await getDocs(notesCollection);
        const notes: Note[] = [];
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            if (isNoteData(data)) {
                 notes.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt.toDate(),
                } as Note);
            }
        });
        // Sort notes by creation date, newest first
        return notes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw new Error("Could not fetch notes from database.");
    }
}

export async function deleteNote(id: string): Promise<void> {
    try {
        const noteDoc = doc(db, 'notes', id);
        await deleteDoc(noteDoc);
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw new Error("Could not delete note from database.");
    }
}
