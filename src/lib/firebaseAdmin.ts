/**
 * src/lib/firebaseAdmin.ts
 * Robust firebase-admin initialization used by server-side API routes.
 *
 * Required env vars:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY  (escaped newlines as \n is OK; this file will convert \\n -> \n)
 * - FIREBASE_STORAGE_BUCKET (optional; defaults to <projectId>.appspot.com)
 */

import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("Firebase Admin env missing:", {
    FIREBASE_PROJECT_ID: !!projectId,
    FIREBASE_CLIENT_EMAIL: !!clientEmail,
    HAS_FIREBASE_PRIVATE_KEY: !!privateKey,
  });
  throw new Error(
    "Missing Firebase Admin env vars. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local"
  );
}

// Convert escaped newlines to real newlines if needed (common when storing in .env)
privateKey = privateKey.replace(/\\n/g, "\n");

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    });
  }
  // Safe to export Firestore / Auth now
  console.log("✅ Firebase Admin initialized for project:", projectId);
} catch (err) {
  console.error("❌ Firebase Admin initialization failed:", err);
  throw err;
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
