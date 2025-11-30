
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH;
const serviceAccountEnv = process.env.FIREBASE_ADMIN_SDK; // optional JSON string

let credentials: admin.ServiceAccount | undefined;

if (serviceAccountPath) {
  const resolved = path.resolve(process.cwd(), serviceAccountPath);
  if (fs.existsSync(resolved)) {
    const raw = fs.readFileSync(resolved, 'utf8');
    credentials = JSON.parse(raw) as admin.ServiceAccount;
  } else {
    console.warn(`[firebaseAdmin] Service account file not found at ${resolved}. Backend features may be disabled.`);
  }
} else if (serviceAccountEnv) {
  try {
    credentials = JSON.parse(serviceAccountEnv);
  } catch (err) {
    console.warn('[firebaseAdmin] Failed to parse FIREBASE_ADMIN_SDK env var. Backend features may be disabled.');
  }
}

// initialize only once
if (!admin.apps.length) {
  if (credentials) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
  } else {
      console.warn('Firebase Admin SDK credentials not found. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH or FIREBASE_ADMIN_SDK. Backend features will be disabled.');
  }
}

const adminDb = admin.apps.length ? admin.firestore() : null;
const adminAuth = admin.apps.length ? admin.auth() : null;
const adminStorage = admin.apps.length ? admin.storage() : null;

export { adminDb, adminAuth, adminStorage };
