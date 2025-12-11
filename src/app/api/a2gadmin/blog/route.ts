
// src/app/api/a2gadmin/blog/route.ts
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION_NAME = "posts";

// GET all or a single Post
export async function GET(req: NextRequest) {
  try {
    const { getAdminDb } = await import("@/lib/firebaseAdmin");
    const adminDb = getAdminDb();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Get single document
      const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({ post: { id: docSnap.id, ...docSnap.data() } });
    }

    // Get all documents
    const snapshot = await adminDb.collection(COLLECTION_NAME).orderBy("createdAt", "desc").get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ posts });

  } catch (err: any) {
    console.error("Blog GET Error:", err);
    return NextResponse.json({ error: "Server error occurred while fetching posts" }, { status: 500 });
  }
}

// CREATE a new Post
export async function POST(req: NextRequest) {
  try {
    const { getAdminDb } = await import("@/lib/firebaseAdmin");
    const adminDb = getAdminDb();
    const body = await req.json();
    const { title, slug, content } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Title, Slug, and Content are required." }, { status: 400 });
    }

    const newPost = {
      ...body,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection(COLLECTION_NAME).add(newPost);
    return NextResponse.json({ id: docRef.id }, { status: 201 });

  } catch (err: any) {
    console.error("Blog POST Error:", err);
    return NextResponse.json({ error: "Server error during post creation" }, { status: 500 });
  }
}

// UPDATE an existing Post
export async function PUT(req: NextRequest) {
    try {
        const { getAdminDb } = await import("@/lib/firebaseAdmin");
        const adminDb = getAdminDb();
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
        
        const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
        
        // Ensure the doc exists before updating
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const updatedData = {
            ...body,
            updatedAt: FieldValue.serverTimestamp(),
        };

        await docRef.update(updatedData);

        return NextResponse.json({ id, message: "Post updated successfully" });

    } catch (err: any) {
        console.error("Blog PUT Error:", err);
        return NextResponse.json({ error: "Server error during post update." }, { status: 500 });
    }
}


// DELETE a Post
export async function DELETE(req: NextRequest) {
  try {
    const { getAdminDb } = await import("@/lib/firebaseAdmin");
    const adminDb = getAdminDb();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Post ID is required for deletion." }, { status: 400 });
    }

    await adminDb.collection(COLLECTION_NAME).doc(id).delete();
    return NextResponse.json({ message: "Post deleted successfully" });

  } catch (err: any) {
    console.error("Blog DELETE Error:", err);
    return NextResponse.json({ error: "Server error during post deletion." }, { status: 500 });
  }
}
