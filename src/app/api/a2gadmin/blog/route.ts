// src/app/api/a2gadmin/blog/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { isAdminAuthenticated } from "@/lib/verifyAdminSession";
import { Timestamp } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

// GET all or a single Post
export async function GET(req: NextRequest) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (id) {
            // Get single document
            const docRef = adminDb.collection("posts").doc(id);
            const docSnap = await docRef.get();
            if (!docSnap.exists) {
                return NextResponse.json({ error: "Post not found" }, { status: 404 });
            }
            return NextResponse.json({ post: { id: docSnap.id, ...docSnap.data() } });
        }

        // Get all documents
        const snapshot = await adminDb.collection("posts").orderBy("createdAt", "desc").get();
        const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return NextResponse.json({ posts });

    } catch (err: any) {
        console.error("Blog GET Error:", err);
        return NextResponse.json({ error: "Server error occurred while fetching posts" }, { status: 500 });
    }
}

// CREATE a new Post
export async function POST(req: NextRequest) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    try {
        const body = await req.json();
        const { title, slug, content } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: "Title, Slug, and Content are required." }, { status: 400 });
        }

        const newPost = {
            ...body,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await adminDb.collection("posts").add(newPost);
        return NextResponse.json({ id: docRef.id }, { status: 201 });

    } catch (err: any) {
        console.error("Blog POST Error:", err);
        return NextResponse.json({ error: "Server error during post creation" }, { status: 500 });
    }
}

// UPDATE an existing Post
export async function PUT(req: NextRequest) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
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
        
        const docRef = adminDb.collection("posts").doc(id);

        const updatedData = {
            ...body,
            updatedAt: Timestamp.now(),
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
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Post ID is required for deletion." }, { status: 400 });
        }

        await adminDb.collection("posts").doc(id).delete();
        return NextResponse.json({ message: "Post deleted successfully" });

    } catch (err: any) {
        console.error("Blog DELETE Error:", err);
        return NextResponse.json({ error: "Server error during post deletion." }, { status: 500 });
    }
}
