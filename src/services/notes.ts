
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { GenerateNotesInput } from '@/ai/flows/generate-notes';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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


export async function addNote(note: Omit<Note, 'id'>) {
    addDoc(notesCollection, {
        ...note,
        createdAt: serverTimestamp() 
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: notesCollection.path,
          operation: 'create',
          requestResourceData: note,
        });
        errorEmitter.emit('permission-error', permissionError);
        // We throw the original error as well to not swallow it completely
        // in case there's another non-permissions issue.
        throw serverError;
    });
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
        
        const permissionError = new FirestorePermissionError({
          path: notesCollection.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);

        throw new Error("Could not fetch notes from database.");
    }
}

export async function deleteNote(id: string): Promise<void> {
    const noteDoc = doc(db, 'notes', id);
    deleteDoc(noteDoc).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: noteDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
