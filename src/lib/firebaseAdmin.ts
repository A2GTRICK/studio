/**
 * src/lib/firebaseAdmin.ts
 * Initializes firebase-admin. Exports adminDb (Firestore instance).
 *
 * Required env vars:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_PRIVATE_KEY (newline escaped as \n; this file will replace \\n -> \n)
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_STORAGE_BUCKET (optional)
 */
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
