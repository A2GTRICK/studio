
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!privateKey) {
  console.error("❌ FIREBASE_ADMIN_PRIVATE_KEY IS MISSING");
}

const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: privateKey?.replace(/\\n/g, "\n"),
};

if (!getApps().length) {
  initializeApp({
    credential: cert(adminConfig),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();

export function getAdmin() {
    // This is a placeholder for the full 'admin' object if needed elsewhere.
    // Be cautious as direct use can pull in unwanted dependencies.
    // For now, this is kept minimal.
    const { getFirestore: getAdminFirestore } = require("firebase-admin/firestore");

    return {
        firestore: {
            FieldValue: getAdminFirestore().FieldValue,
        }
    }
}
