
'use server';

import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, QueryDocumentSnapshot, DocumentData, query, orderBy } from 'firebase/firestore';
import { GenerateNotesInput } from '@/ai/flows/generate-notes';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export interface Note extends GenerateNotesInput {
    id: string;
    notes: string;
    createdAt: any; // Can be Date or Firebase Timestamp
    updatedAt?: any;
    short?: string;
    isPremium?: boolean;
    content?: string;
}

const notesCollection = collection(db, 'notes');

// Type guard to check if a Firestore document has the 'createdAt' field as a Timestamp
function isNoteData(docData: DocumentData): docData is { createdAt: import('firebase/firestore').Timestamp } & Omit<Note, 'createdAt' | 'id'> {
    return docData.createdAt && typeof docData.createdAt.toDate === 'function';
}

export async function addNote(note: Omit<Note, 'id' | 'createdAt'>) {
    const noteData = {
        ...note,
        createdAt: serverTimestamp() 
    };
    try {
        await addDoc(notesCollection, noteData);
    } catch(serverError) {
        const permissionError = new FirestorePermissionError({
          path: notesCollection.path,
          operation: 'create',
          requestResourceData: noteData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    };
}

export async function fetchAllNotes(): Promise<Note[]> {
  try {
    const notesRef = collection(db, "notes");
    const q = query(notesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : null,
        } as Note;
    });
  } catch (error) {
    console.error("Failed to fetch notes:", error);
    // In a real app, you might want to throw a more specific error
    // or handle it gracefully. For now, we return an empty array.
    return [];
  }
}


export async function deleteNote(id: string): Promise<void> {
    const noteDoc = doc(db, 'notes', id);
    try {
        await deleteDoc(noteDoc);
    } catch(serverError) {
        const permissionError = new FirestorePermissionError({
            path: noteDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    };
}
