
// src/app/api/a2gadmin/notes/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb, adminStorage } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";

/**
 * Get storage bucket name from admin app (will throw earlier if admin not initialized)
 */
const BUCKET_NAME = (() => {
  try {
    return adminStorage.bucket().name;
  } catch (e) {
    // If admin initialization failed this will be informative in logs
    console.error("Failed to get storage bucket name from admin:", e);
    return process.env.FIREBASE_STORAGE_BUCKET || "";
  }
})();

/**
 * Upload helper: accepts a File (Web Fetch API File) and writes to Google Cloud Storage
 * Returns a public url to the stored file.
 */
async function uploadFileToStorage(path: string, file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const bucket = adminStorage.bucket(BUCKET_NAME);
  const fileRef = bucket.file(path);
  await fileRef.save(buffer, {
    metadata: { contentType: file.type || "application/octet-stream" },
    resumable: false,
  });

  try {
    await fileRef.makePublic();
  } catch (e) {
    // makePublic may fail if bucket policy prevents it; warn but continue
    console.warn("Warning: failed to make file public:", e);
  }

  return `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(
    fileRef.name
  )}`;
}

function sanitizeString(v: any) {
  if (v === undefined || v === null) return "";
  return typeof v === "string" ? v : String(v);
}

/* ------------------------
   GET — list notes (admin)
   ------------------------ */
export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb
      .collection("notes")
      .orderBy("createdAt", "desc")
      .get();

    const notes = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || null,
      };
    });

    return NextResponse.json({ notes });
  } catch (err: any) {
    console.error("Admin GET notes error:", err);
    return NextResponse.json(
      {
        error: "Server error occurred while fetching notes",
        message: String(err?.message || err),
        stack: err?.stack ? String(err.stack) : undefined,
      },
      { status: 500 }
    );
  }
}

/* ------------------------
   POST — create note (admin)
   Accepts form-data with fields and file uploads
   ------------------------ */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // Basic fields
    const title = sanitizeString(form.get("title"));
    const subject = sanitizeString(form.get("subject"));
    const course = sanitizeString(form.get("course"));
    const year = sanitizeString(form.get("year"));
    const topic = sanitizeString(form.get("topic"));
    const universitySyllabus = sanitizeString(form.get("universitySyllabus"));
    const short = sanitizeString(form.get("short"));
    const isPremium =
      form.get("isPremium") === "true" || form.get("isPremium") === "on";
    const content = sanitizeString(form.get("content") || form.get("notes") || "");

    // externalLinks — optional JSON string
    let externalLinks: any[] = [];
    const ext = form.get("externalLinks");
    if (ext) {
      try {
        externalLinks = typeof ext === "string" ? JSON.parse(ext) : JSON.parse(String(ext));
      } catch {
        externalLinks = [];
      }
    }

    // Create Firestore doc first to obtain an ID for storage path
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
      notes: content, // legacy alias
      attachments: [],
      externalLinks,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const noteId = docRef.id;
    const attachments: string[] = [];

    // Upload any attached files in form-data
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
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/* ------------------------
   PUT — update note (admin)
   Expects query param ?id=<docId> and form-data body
   ------------------------ */
export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const form = await req.formData();

    // Read existing doc
    const docRef = adminDb.collection("notes").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    const updates: any = {};
    // Update only provided fields
    const possibleFields = [
      "title",
      "subject",
      "course",
      "year",
      "topic",
      "universitySyllabus",
      "short",
    ];
    possibleFields.forEach((f) => {
      if (form.get(f) !== null) updates[f] = sanitizeString(form.get(f));
    });

    if (form.get("isPremium") !== null)
      updates.isPremium = form.get("isPremium") === "true" || form.get("isPremium") === "on";

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

    // Attachments: append newly uploaded files
    const existingData = snap.data() || {};
    const existingAttachments: string[] = Array.isArray(existingData.attachments) ? existingData.attachments : [];
    const newAttachments: string[] = [];

    for (const [, value] of (form as any).entries()) {
      if (value instanceof File && value.size > 0) {
        const filename = `${Date.now()}-${uuidv4()}-${value.name}`;
        const path = `notes/${id}/${filename}`;
        const url = await uploadFileToStorage(path, value);
        newAttachments.push(url);
      }
    }

    if (newAttachments.length) {
      updates.attachments = [...existingAttachments, ...newAttachments];
    }

    if (Object.keys(updates).length) {
      updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      await docRef.update(updates);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin PUT notes error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/* ------------------------
   DELETE — delete note and its attachments
   Expects query param ?id=<docId>
   ------------------------ */
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const docRef = adminDb.collection("notes").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    // Delete attachments from storage (best-effort)
    const data = snap.data() || {};
    const attachments: string[] = Array.isArray(data.attachments) ? data.attachments : [];

    const bucket = adminStorage.bucket(BUCKET_NAME);
    for (const fileUrl of attachments) {
      try {
        // Expect url like: https://storage.googleapis.com/<bucket>/<path>
        const parts = String(fileUrl).split(`${bucket.name}/`);
        const path = parts.length > 1 ? decodeURIComponent(parts[1]) : null;
        if (path) {
          await bucket.file(path).delete().catch(() => {});
        } else {
          // Try alternative extraction if URL pattern differs
          const u = new URL(String(fileUrl));
          const candidate = u.pathname.replace(/^\/+/, "");
          if (candidate) await bucket.file(candidate).delete().catch(() => {});
        }
      } catch (e) {
        console.warn("Failed to delete file:", fileUrl, e);
      }
    }

    // Delete Firestore document
    await docRef.delete();

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin DELETE notes error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
