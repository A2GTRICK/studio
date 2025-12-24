// src/app/api/a2gadmin/notes/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { adminDb } from "@/lib/firebaseAdmin";
import { isAdminAuthenticated } from "@/lib/verifyAdminSession";
import { FieldValue } from "firebase-admin/firestore";

/* ================================
   GET — list notes OR get single note (admin)
================================ */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    // Fetch single note
    if (id) {
      const snap = await adminDb.collection("notes").doc(id).get();

      if (!snap.exists) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }

      const data = snap.data()!;
      const note = {
        id: snap.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : null,
      };

      return NextResponse.json({ note });
    }

    // Fetch all notes
    const snaps = await adminDb
      .collection("notes")
      .orderBy("updatedAt", "desc")
      .get();

    const notes = snaps.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    });

    return NextResponse.json({ notes });
  } catch (err: any) {
    console.error("Admin GET notes error:", err);
    return NextResponse.json(
      {
        error: "Server error occurred while fetching notes",
        message: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

/* ================================
   PUT — update note (admin only)
================================ */
export async function PUT(req: NextRequest) {
  // 🔐 Admin verification (server-side)
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Note ID is required" },
      { status: 400 }
    );
  }

  try {
    const formData = await req.formData();
    const dataToUpdate: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (key === "isPremium") {
        dataToUpdate[key] = value === "true";
      } else if (key === "price") {
        dataToUpdate[key] = value ? Number(value) : null;
      } else {
        dataToUpdate[key] = value;
      }
    });

    await adminDb.collection("notes").doc(id).update({
      ...dataToUpdate,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("Admin PUT note error:", err);
    return NextResponse.json(
      {
        error: "Server error occurred while updating the note",
        message: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

/*
  NOTE:
  - POST & DELETE intentionally omitted
  - Admin writes are handled ONLY via Admin SDK
  - Firestore rules are NOT involved here
*/
