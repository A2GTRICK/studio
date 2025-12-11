// src/app/api/a2gadmin/notes/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

// -------------------------
// FILE UPLOAD HELPER
// -------------------------
async function uploadFileToStorage(path: string, file: File) {
  const { getAdminStorage } = await import("@/lib/firebaseAdmin");
  const adminStorage = getAdminStorage();
  const BUCKET_NAME = adminStorage.bucket().name;
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const bucket = adminStorage.bucket(BUCKET_NAME);
  const fileRef = bucket.file(path);

  await fileRef.save(buffer, {
    metadata: { contentType: file.type },
    resumable: false,
  });

  try {
    await fileRef.makePublic();
  } catch {}

  return `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(
    fileRef.name
  )}`;
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
    const { getAdminDb } = await import("@/lib/firebaseAdmin");
    const adminDb = getAdminDb();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    // GET SINGLE NOTE
    if (id) {
      const doc = await adminDb.collection("notes").doc(id).get();

      if (!doc.exists) {
        return NextResponse.json({ error: "Note not found" }, { status: 404 });
      }

      const data = doc.data();
      return NextResponse.json({
        note: {
          id: doc.id,
          ...data,
          createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : null,
        },
      });
    }

    // GET ALL NOTES
    // ❗ FIX: Order by `updatedAt` as `createdAt` might be missing on old docs.
    const snapshot = await adminDb
      .collection("notes")
      .orderBy("updatedAt", "desc")
      .get();

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
    const { getAdminDb, getAdmin } = await import("@/lib/firebaseAdmin");
    const adminDb = getAdminDb();
    const admin = getAdmin();
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

    const docRef = await adminDb.collection("notes").add({
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
      await docRef.update({ attachments });
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
    const { getAdminDb, getAdmin } = await import("@/lib/firebaseAdmin");
    const adminDb = getAdminDb();
    const admin = getAdmin();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const form = await req.formData();

    const docRef = adminDb.collection("notes").doc(id);
    const snap = await docRef.get();
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

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await docRef.update(updates);

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
    const { getAdminDb, getAdminStorage } = await import("@/lib/firebaseAdmin");
    const adminDb = getAdminDb();
    const adminStorage = getAdminStorage();
    const BUCKET_NAME = adminStorage.bucket().name;
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const docRef = adminDb.collection("notes").doc(id);
    const snap = await docRef.get();
    if (!snap.exists)
      return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const data = snap.data() || {};
    const attachments: string[] = Array.isArray(data.attachments)
      ? data.attachments
      : [];

    const bucket = adminStorage.bucket(BUCKET_NAME);

    for (const fileUrl of attachments) {
      try {
        const path = decodeURIComponent(
          fileUrl.split(`${bucket.name}/`)[1]
        );
        await bucket.file(path).delete().catch(() => {});
      } catch (e) {
        console.warn("Failed to delete file:", fileUrl, e);
      }
    }

    await docRef.delete();

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin DELETE notes error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
