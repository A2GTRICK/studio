// src/app/api/mcq-sets/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION_NAME = "mcqSets";

// GET all PUBLISHED MCQ sets
export async function GET() {
  try {
    const q = adminDb.collection(COLLECTION_NAME)
      .where("isPublished", "==", true)
      .orderBy("createdAt", "desc");
      
    const snapshot = await q.get();

    const sets = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : null,
        updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : null,
      }
    });

    return NextResponse.json({ sets });

  } catch (err: any) {
    console.error("Public MCQ GET Error:", err);
    return NextResponse.json({ error: "Server error occurred" }, { status: 500 });
  }
}
