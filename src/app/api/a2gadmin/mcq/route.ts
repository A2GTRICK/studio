
// src/app/api/a2gadmin/mcq/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb } from "@/firebase/admin";
import { isAdminAuthenticated } from "@/lib/verifyAdminSession";

// Helper to sanitize form data
function sanitize(value: any): any {
  if (value === null || value === undefined) return null;
  if (value instanceof File) return value; // Keep files for upload handling if needed
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === 'object' && !Buffer.isBuffer(value)) {
      const sanitizedObject: { [key: string]: any } = {};
      for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
              sanitizedObject[key] = sanitize(value[key]);
          }
      }
      return sanitizedObject;
  }
  return String(value);
}


/* ------------------------
   GET — list/get single mcqSet (admin)
   ?id=<docId>
   ------------------------ */
export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  try {
     if (id) {
        const docRef = adminDb.collection("mcqSets").doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return NextResponse.json({ set: { id: docSnap.id, ...docSnap.data() } });
        } else {
            return NextResponse.json({ error: "MCQ set not found" }, { status: 404 });
        }
     } else {
        const snapshot = await adminDb.collection("mcqSets").orderBy("createdAt", "desc").get();
        const sets = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        return NextResponse.json({ sets });
     }
  } catch (err: any) {
    console.error("Admin GET mcqSets error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* ------------------------
   POST — create mcqSet (admin)
   ------------------------ */
export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const payload = await req.json();
    const sanitizedPayload = sanitize(payload);

    const docRef = await adminDb.collection("mcqSets").add({
      ...sanitizedPayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (err: any) {
    console.error("Admin POST mcqSets error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/* ------------------------
   PUT — update mcqSet (admin)
   ?id=<docId>
   ------------------------ */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const payload = await req.json();
    const sanitizedPayload = sanitize(payload);
    
    const docRef = adminDb.collection("mcqSets").doc(id);
    await docRef.update({
      ...sanitizedPayload,
      updatedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin PUT mcqSets error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/* ------------------------
   DELETE — delete mcqSet (admin)
   ?id=<docId>
   ------------------------ */
export async function DELETE(req: NextRequest) {
    if (!isAdminAuthenticated(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        await adminDb.collection("mcqSets").doc(id).delete();
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        console.error("Admin DELETE mcqSets error:", err);
        return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
    }
}
