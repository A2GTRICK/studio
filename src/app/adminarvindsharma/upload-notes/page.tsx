"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { getStorage, ref, uploadBytes, getDownloadURL, StorageReference } from "firebase/storage";
import { useFirebaseApp } from "@/firebase/provider";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


export default function UploadNote() {
  const router = useRouter();
  const db = useFirestore();
  const app = useFirebaseApp();
  const storage = app ? getStorage(app) : null;


  // NOTE FIELDS
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [content, setContent] = useState("");

  // MEDIA
  const [images, setImages] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [videoLink, setVideoLink] = useState("");

  // Others
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  async function uploadFileToStorage(file: File, path: string): Promise<string> {
    if (!storage) throw new Error("Firebase Storage is not available.");
    const fileRef: StorageReference = ref(storage, `${path}/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  async function handleSave() {
    if (!db) {
        alert("Firestore is not initialized.");
        return;
    }
    if (!storage) {
        alert("Firebase Storage is not initialized.");
        return;
    }
    if (!title || !subject || !course || !year || !content) {
      alert("All fields (Title, Subject, Course, Year, Content) are required.");
      return;
    }

    setLoading(true);

    try {
      // Upload IMAGES
      const imageUrls: string[] = [];
      for (const img of images) {
        const url = await uploadFileToStorage(img, "notes/images");
        imageUrls.push(url);
      }

      // Upload PDF
      let pdfUrl = "";
      if (pdfFile) {
        pdfUrl = await uploadFileToStorage(pdfFile, "notes/pdfs");
      }

      // Upload Attachments
      const attachmentUrls: string[] = [];
      for (const file of attachments) {
        const url = await uploadFileToStorage(file, "notes/attachments");
        attachmentUrls.push(url);
      }
      
      const adminKey = sessionStorage.getItem("A2G_ADMIN_KEY") || "";
      if (!adminKey) {
        alert("Admin key not found. Please log in again.");
        setLoading(false);
        return;
      }

      // Save to Firestore
      const notesCollection = collection(db, "notes");
      const noteData = {
        title,
        subject,
        course,
        year,
        content,
        images: imageUrls,
        videoLink,
        pdfUrl,
        attachments: attachmentUrls,
        isPremium: premium,
        createdAt: serverTimestamp(),
        adminKey,
      };

      await addDoc(notesCollection, noteData).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: notesCollection.path,
          operation: 'create',
          requestResourceData: noteData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // re-throw to be caught by outer catch
      });

      alert("✅ Note uploaded successfully!");
      router.push("/adminarvindsharma/dashboard");

    } catch (err) {
      console.error(err);
      alert("❌ Upload failed! Check console and Firestore rules.");
    }

    setLoading(false);
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          📤 Upload Note (Premium Studio)
        </h1>
        <p className="text-gray-600">Add all types of study materials in one place.</p>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white shadow-md rounded-2xl p-6 md:p-8 border border-gray-200 space-y-10">

        {/* BASIC FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="font-semibold text-gray-700">Title</label>
            <input 
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Introduction to Pharmacology"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Subject</label>
            <input 
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., Pharmacology"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Course</label>
            <input 
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., B.Pharm"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Year</label>
            <input 
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="e.g., 2nd Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </div>

        {/* CONTENT */}
        <div>
          <label className="font-semibold text-gray-700">Full Text Content</label>
          <textarea
            rows={10}
            placeholder="Write full notes here... Markdown supported."
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* IMAGES */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">Upload Images</label>
          <input 
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files || []))}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
           {images.length > 0 && <p className="text-xs text-gray-500 mt-1">{images.length} image(s) selected.</p>}
        </div>

        {/* VIDEO LINK */}
        <div>
          <label className="font-semibold text-gray-700">Video Link (YouTube / Drive)</label>
          <input 
            type="text"
            placeholder="https://youtube.com/..."
            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />
        </div>

        {/* PDF */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">Upload PDF</label>
          <input 
            type="file"
            accept="application/pdf"
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />
          {pdfFile && <p className="text-xs text-gray-500 mt-1">{pdfFile.name} selected.</p>}
        </div>

        {/* ATTACHMENTS */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">Upload Additional Attachments</label>
          <input 
            type="file"
            multiple
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
          />
          {attachments.length > 0 && <p className="text-xs text-gray-500 mt-1">{attachments.length} file(s) selected.</p>}
        </div>

        {/* PREMIUM TOGGLE */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          <input 
            type="checkbox"
            id="is-premium"
            checked={premium}
            onChange={(e) => setPremium(e.target.checked)}
            className="w-5 h-5 accent-purple-600 rounded"
          />
          <label htmlFor="is-premium" className="font-medium text-gray-700 cursor-pointer">Mark as Premium Content</label>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
          <button
            onClick={() => router.push("/adminarvindsharma/dashboard")}
            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition-colors order-2 sm:order-1"
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={handleSave}
            disabled={loading || !db || !storage}
            className="px-8 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            {loading ? "Uploading..." : "💾 Save Note"}
          </button>
        </div>

      </div>
    </div>
  );
}
