// src/lib/firebaseAdmin.ts
import admin from "firebase-admin";

// We expect FIREBASE_ADMIN_KEY to contain the full JSON of your service account
const saJson = process.env.FIREBASE_ADMIN_KEY
  ? JSON.parse(process.env.FIREBASE_ADMIN_KEY)
  : null;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: saJson
      ? admin.credential.cert(saJson as admin.ServiceAccount)
      : admin.credential.applicationDefault(),
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminFieldValue = admin.firestore.FieldValue;
export { admin };
