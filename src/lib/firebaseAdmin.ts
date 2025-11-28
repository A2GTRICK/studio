import admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_ADMIN_KEY
  ? JSON.parse(process.env.FIREBASE_ADMIN_KEY)
  : null;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault(),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
