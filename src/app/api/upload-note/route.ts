// src/app/api/upload-note/route.ts
import { NextResponse } from "next/server";
import { db, storage } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = String(formData.get("title") || "");
    const subject = String(formData.get("subject") || "");
    const course = String(formData.get("course") || "");
    const year = String(formData.get("year") || "");
    const content = String(formData.get("content") || "");
    const isPremium = String(formData.get("isPremium") || "false") === "true";
    const externalLinks = JSON.parse(String(formData.get("externalLinks") || "[]"));

    // attachments may be multiple
    const files = formData.getAll("attachments") as File[] | [];

    const attachmentsUrls: string[] = [];

    for (const file of files) {
      if (!file || (file as any).size === 0) continue;
      // create a storage ref with a timestamped name
      const filename = `${Date.now()}-${(file as any).name || "upload"}`;
      const fileRef = ref(storage, `notes/${filename}`);

      // convert File to ArrayBuffer then to Uint8Array
      const buffer = await (file as any).arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      // upload bytes
      await uploadBytes(fileRef, uint8);

      const url = await getDownloadURL(fileRef);
      attachmentsUrls.push(url);
    }

    // create firestore document
    const docRef = await addDoc(collection(db, "notes"), {
      title,
      subject,
      course,
      year,
      content,
      isPremium,
      attachments: attachmentsUrls,
      externalLinks,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Upload Note API error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
