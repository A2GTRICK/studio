
// src/app/api/a2gadmin/notes/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminDb, default as admin } from "@/lib/firebaseAdmin"; // adminDb + admin
import { v4 as uuidv4 } from "uuid";

// 🚀 FIXED: Get bucket name from the initialized admin app, not from a separate env var.
const BUCKET_NAME = admin.storage().bucket().name;

async function uploadFileToStorage(path: string, file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const bucket = admin.storage().bucket(BUCKET_NAME);
  const fileRef = bucket.file(path);
  await fileRef.save(buffer, {
    metadata: { contentType: file.type },
    resumable: false,
  });
  // Make public (so user side can access)
  try {
    await fileRef.makePublic();
  } catch (e) {
    // ignore if already public or permission issue
  }
  return `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(fileRef.name)}`;
}

function sanitizeString(v: any) {
  if (v === undefined || v === null) return "";
  return typeof v === "string" ? v : String(v);
}

export async function GET(req: NextRequest) {
  try {
    const snapshot = await adminDb.collection("notes").orderBy("createdAt", "desc").get();
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
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

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
    const isPremium = form.get("isPremium") === "true" || form.get("isPremium") === "on";
    const content = sanitizeString(form.get("content") || form.get("notes") || "");
    // externalLinks: expect JSON string or multiple fields like externalLinks[0].label etc.
    let externalLinks: any[] = [];
    const ext = form.get("externalLinks");
    if (ext) {
      try {
        externalLinks = typeof ext === "string" ? JSON.parse(ext) : JSON.parse(String(ext));
      } catch {
        externalLinks = [];
      }
    }

    // Create Firestore doc first to have ID for upload path
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
      notes: content, // duplicate for legacy
      attachments: [],
      externalLinks,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const noteId = docRef.id;
    const attachments: string[] = [];

    // Upload files: handle fields named 'pdf' single and 'images' multiple, or any file entries
    for (const [key, value] of (form as any).entries()) {
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
    if (form.get("title") !== null) updates.title = sanitizeString(form.get("title"));
    if (form.get("subject") !== null) updates.subject = sanitizeString(form.get("subject"));
    if (form.get("course") !== null) updates.course = sanitizeString(form.get("course"));
    if (form.get("year") !== null) updates.year = sanitizeString(form.get("year"));
    if (form.get("topic") !== null) updates.topic = sanitizeString(form.get("topic"));
    if (form.get("universitySyllabus") !== null) updates.universitySyllabus = sanitizeString(form.get("universitySyllabus"));
    if (form.get("short") !== null) updates.short = sanitizeString(form.get("short"));
    if (form.get("isPremium") !== null) updates.isPremium = form.get("isPremium") === "true" || form.get("isPremium") === "on";
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

    // Handle new file uploads and append to attachments
    const existingData = snap.data() || {};
    const existingAttachments: string[] = Array.isArray(existingData.attachments) ? existingData.attachments : [];
    const newAttachments: string[] = [];

    for (const [key, value] of (form as any).entries()) {
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

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const docRef = adminDb.collection("notes").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: "Note not found" }, { status: 404 });

    // Delete attachments from storage (if any)
    const data = snap.data() || {};
    const attachments: string[] = Array.isArray(data.attachments) ? data.attachments : [];

    const bucket = admin.storage().bucket(BUCKET_NAME);
    for (const url of attachments) {
      try {
        // url pattern: https://storage.googleapis.com/<bucket>/<encodedPath>
        const prefix = `https://storage.googleapis.com/${bucket.name}/`;
        if (url.startsWith(prefix)) {
          const filePath = decodeURIComponent(url.substring(prefix.length));
          await bucket.file(filePath).delete().catch(() => {});
        }
      } catch (e) {
        // continue
      }
    }

    await docRef.delete();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Admin DELETE notes error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
