/**
 * SAFE Firebase Admin Initialization
 */

import * as admin from "firebase-admin";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required env variable: ${name}`);
    throw new Error(`Missing env variable: ${name}`);
  }
  return value;
}

if (!admin.apps.length) {
  // Load all env vars safely
  const projectId = getEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getEnv("FIREBASE_CLIENT_EMAIL");
  const rawKey = getEnv("FIREBASE_PRIVATE_KEY");

  // Ensure private key has proper newlines
  const privateKey = rawKey.replace(/\\n/g, "\n");

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        `${projectId}.appspot.com`,
    });

    console.log("✅ Firebase Admin initialized successfully");
  } catch (err) {
    console.error("❌ Firebase Admin failed to initialize:", err);
    throw err; // STOP NEXT.JS so API doesn't silently break
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
