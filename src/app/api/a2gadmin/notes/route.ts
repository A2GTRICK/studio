
// src/app/api/a2gadmin/notes/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "@/firebase/config";
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";


// -------------------------
// FILE UPLOAD HELPER
// -------------------------
async function uploadFileToStorage(path: string, file: File) {
  const fileRef = ref(storage, path);
  const arrayBuffer = await file.arrayBuffer();
  await uploadBytes(fileRef, arrayBuffer, {
    contentType: file.type,
  });
  return getDownloadURL(fileRef);
}

function sanitizeString(v: any) {
  if (v === undefined || v === null) return "";
  return typeof v === "string" ? v : String(v);
}

// -------------------------
// GET ALL NOTES
// -------------------------
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    // GET SINGLE NOTE
    if (id) {
      const docRef = doc(db, "notes", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }

      const data = docSnap.data();
      return NextResponse.json({
        note: {
          id: docSnap.id,
          ...data,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : null,
        },
      });
    }

    // GET ALL NOTES
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const notes = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
      };
    });

    return NextResponse.json({ notes });

  } catch (err: any) {
    console.error("Admin GET notes error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// -------------------------
// CREATE NOTE
// -------------------------
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const title = sanitizeString(form.get("title"));
    const subject = sanitizeString(form.get("subject"));
    const course = sanitizeString(form.get("course"));
    const year = sanitizeString(form.get("year"));
    const topic = sanitizeString(form.get("topic"));
    const universitySyllabus = sanitizeString(
      form.get("universitySyllabus")
    );
    const short = sanitizeString(form.get("short"));
    const isPremium =
      form.get("isPremium") === "true" || form.get("isPremium") === "on";
    const content = sanitizeString(
      form.get("content") || form.get("notes") || ""
    );

    let externalLinks: any[] = [];
    const ext = form.get("externalLinks");
    if (ext) {
      try {
        externalLinks =
          typeof ext === "string" ? JSON.parse(ext) : JSON.parse(String(ext));
      } catch {
        externalLinks = [];
      }
    }

    const docRef = await addDoc(collection(db, "notes"), {
      title,
      subject,
      course,
      year,
      topic,
      universitySyllabus,
      short,
      isPremium,
      content,
      notes: content,
      attachments: [],
      externalLinks,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const noteId = docRef.id;
    const attachments: string[] = [];

    for (const [, value] of (form as any).entries()) {
      if (value instanceof File && value.size > 0) {
        const filename = `${Date.now()}-${uuidv4()}-${value.name}`;
        const path = `notes/${noteId}/${filename}`;
        const url = await uploadFileToStorage(path, value);
        attachments.push(url);
      }
    }

    if (attachments.length) {
      await updateDoc(docRef, { attachments });
    }

    return NextResponse.json({ id: noteId }, { status: 201 });
  } catch (err: any) {
    console.error("Admin POST notes error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// -------------------------
// UPDATE NOTE
// -------------------------
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const form = await req.formData();

    const docRef = doc(db, "notes", id);
    const snap = await getDoc(docRef);
    if (!snap.exists)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const updates: any = {};

    const fields = [
      "title",
      "subject",
      "course",
      "year",
      "topic",
      "universitySyllabus",
      "short",
    ];

    fields.forEach((f) => {
      if (form.get(f) !== null) updates[f] = sanitizeString(form.get(f));
    });

    if (form.get("isPremium") !== null)
      updates.isPremium =
        form.get("isPremium") === "true" || form.get("isPremium") === "on";

    if (form.get("content") !== null) {
      updates.content = sanitizeString(form.get("content"));
      updates.notes = updates.content;
    }

    if (form.get("externalLinks") !== null) {
      try {
        updates.externalLinks = JSON.parse(String(form.get("externalLinks")));
      } catch {
        updates.externalLinks = [];
      }
    }

    const existing = snap.data() || {};
    const existingAttachments: string[] = Array.isArray(existing.attachments)
      ? existing.attachments
      : [];

    const newAttachments: string[] = [];

    for (const [, value] of (form as any).entries()) {
      if (value instanceof File && value.size > 0) {
        const filename = `${Date.now()}-${uuidv4()}-${value.name}`;
        const path = `notes/${id}/${filename}`;
        const url = await uploadFileToStorage(path, value);
        newAttachments.push(url);
      }
    }

    if (newAttachments.length)
      updates.attachments = [...existingAttachments, ...newAttachments];

    updates.updatedAt = serverTimestamp();

    await updateDoc(docRef, updates);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin PUT notes error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// -------------------------
// DELETE NOTE
// -------------------------
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const docRef = doc(db, "notes", id);
    const snap = await getDoc(docRef);
    if (!snap.exists())
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const data = snap.data() || {};
    const attachments: string[] = Array.isArray(data.attachments)
      ? data.attachments
      : [];

    for (const fileUrl of attachments) {
      try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
      } catch (e: any) {
        if (e.code !== 'storage/object-not-found') {
          console.warn("Failed to delete file:", fileUrl, e);
        }
      }
    }

    await deleteDoc(docRef);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin DELETE notes error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
