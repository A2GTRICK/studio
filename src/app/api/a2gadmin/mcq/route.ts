// src/app/api/a2gadmin/mcq/route.ts
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

const COLLECTION_NAME = "mcqSets";

// GET all or a single MCQ set
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Get single document
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return NextResponse.json({ error: "MCQ set not found" }, { status: 404 });
      }
      return NextResponse.json({ set: { id: docSnap.id, ...docSnap.data() } });
    }

    // Get all documents
    const q = query(collection(db, COLLECTION_NAME), orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);
    const sets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ sets });

  } catch (err: any) {
    console.error("MCQ GET Error:", err);
    return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
  }
}

// CREATE a new MCQ set
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, course, subject, questions, isPublished } = body;

    if (!title || !course || !subject) {
      return NextResponse.json({ error: "Title, Course, and Subject are required." }, { status: 400 });
    }

    // Ensure questions have IDs if they don't
    const processedQuestions = (questions || []).map((q: any) => ({ ...q, id: q.id || Math.random().toString(36).substring(2) }));

    const newSet = {
      ...body,
      isPublished: isPublished === true, // Ensure it's a boolean, default to false
      questions: processedQuestions,
      questionCount: processedQuestions.length,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newSet);
    return NextResponse.json({ id: docRef.id }, { status: 201 });

  } catch (err: any) {
    console.error("MCQ POST Error:", err);
    return NextResponse.json({ error: "Server error during creation" }, { status: 500 });
  }
}

// UPDATE an existing MCQ set
export async function PUT(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "MCQ set ID is required for update." }, { status: 400 });
        }

        const body = await req.json();
        const { title, course, subject } = body;

        if (!title || !course || !subject) {
            return NextResponse.json({ error: "Title, Course, and Subject are required." }, { status: 400 });
        }
        
        const docRef = doc(db, COLLECTION_NAME, id);

        const updatedData = {
            ...body,
            questionCount: body.questions?.length || 0,
            updatedAt: serverTimestamp(),
        };

        await updateDoc(docRef, updatedData);

        return NextResponse.json({ ok: true });

    } catch (err: any) {
        console.error("MCQ PUT Error:", err);
        return NextResponse.json({ error: "Server error during update." }, { status: 500 });
    }
}


// DELETE an MCQ set
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "MCQ set ID is required for deletion." }, { status: 400 });
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error("MCQ DELETE Error:", err);
    return NextResponse.json({ error: "Server error during deletion." }, { status: 500 });
  }
}
