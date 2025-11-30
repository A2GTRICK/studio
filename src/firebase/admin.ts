
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
      // This will cause the server to fail on startup if credentials are not found,
      // which makes it obvious that the configuration is missing.
      throw new Error('CRITICAL: Firebase Admin SDK credentials not found. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH or FIREBASE_ADMIN_SDK.');
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminStorage = admin.storage();

export { adminDb, adminAuth, adminStorage };
