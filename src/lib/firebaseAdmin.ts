
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

function getAdminApp() {
    if (getApps().length) {
        return getApps()[0];
    }
    return initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminStorage() {
    return getStorage(getAdminApp());
}

export function getAdmin() {
    // This is a placeholder for the full 'admin' object if needed elsewhere.
    // Be cautious as direct use can pull in unwanted dependencies.
    return {
        firestore: {
            FieldValue: getFirestore(getAdminApp()).FieldValue,
        }
    }
}
