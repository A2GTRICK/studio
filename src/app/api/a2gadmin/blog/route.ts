// src/app/api/a2gadmin/blog/route.ts
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION_NAME = "posts";

// GET all or a single Post
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Get single document
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ post: { id: docSnap.id, ...docSnap.data() } });
    }

    // Get all documents
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ posts });

  } catch (err: any) {
    console.error("Blog GET Error:", err);
    return NextResponse.json({ error: "Server error occurred while fetching posts" }, { status: 500 });
  }
}

// CREATE a new Post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, content } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Title, Slug, and Content are required." }, { status: 400 });
    }

    const newPost = {
      ...body,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newPost);
    return NextResponse.json({ id: docRef.id }, { status: 201 });

  } catch (err: any) {
    console.error("Blog POST Error:", err);
    return NextResponse.json({ error: "Server error during post creation" }, { status: 500 });
  }
}

// UPDATE an existing Post
export async function PUT(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Post ID is required for update." }, { status: 400 });
        }

        const body = await req.json();
        const { title, slug, content } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: "Title, Slug, and Content are required." }, { status: 400 });
        }
        
        const docRef = doc(db, COLLECTION_NAME, id);
        
        // Ensure the doc exists before updating
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const updatedData = {
            ...body,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(docRef, updatedData);

        return NextResponse.json({ id, message: "Post updated successfully" });

    } catch (err: any) {
        console.error("Blog PUT Error:", err);
        return NextResponse.json({ error: "Server error during post update." }, { status: 500 });
    }
}


// DELETE a Post
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID is required for deletion." }, { status: 400 });
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return NextResponse.json({ message: "Post deleted successfully" });

  } catch (err: any) {
    console.error("Blog DELETE Error:", err);
    return NextResponse.json({ error: "Server error during post deletion." }, { status: 500 });
  }
}
