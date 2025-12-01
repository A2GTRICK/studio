// src/lib/firebaseAdmin.ts
import admin from 'firebase-admin';

let app: admin.app.App | undefined;

if (!admin.apps.length) {
  // Prefer GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_ADMIN_SERVICE_ACCOUNT JSON
  const saJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (saJson) {
    const parsed = JSON.parse(saJson);
    app = admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = admin.initializeApp();
  } else {
    // fallback - try initialize with project ID (for some hosting)
    app = admin.initializeApp();
  }
} else {
  app = admin.app();
}

export const adminDb = admin.firestore();
export default admin;
