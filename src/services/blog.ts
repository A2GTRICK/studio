
'use server';

import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, getDoc, deleteDoc, doc, serverTimestamp, query, where, Timestamp, updateDoc, orderBy } from 'firebase/firestore';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage?: string;
  authorName: string;
  authorImage?: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const blogCollection = collection(db, 'blog');

// --- Public Read Operations ---

export async function getBlogPosts(): Promise<BlogPost[]> {
    const q = query(blogCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
    const docRef = doc(db, 'blog', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as BlogPost;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const q = query(blogCollection, where('slug', '==', slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as BlogPost;
}


// --- Admin Write Operations ---

type CreatePostDTO = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;
type UpdatePostDTO = Partial<CreatePostDTO> & { id: string };

export async function createBlogPost(postData: CreatePostDTO): Promise<string> {
    const newPost = {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    try {
        const docRef = await addDoc(blogCollection, newPost);
        return docRef.id;
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: blogCollection.path,
            operation: 'create',
            requestResourceData: newPost,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}

export async function updateBlogPost(postData: UpdatePostDTO): Promise<void> {
    const { id, ...dataToUpdate } = postData;
    const docRef = doc(db, 'blog', id);
    const updateData = {
        ...dataToUpdate,
        updatedAt: serverTimestamp(),
    };
    try {
        await updateDoc(docRef, updateData);
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}

export async function deleteBlogPost(id: string): Promise<void> {
    const docRef = doc(db, 'blog', id);
    try {
        await deleteDoc(docRef);
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    }
}
