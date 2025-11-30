
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let initialized = false;

if (!admin.apps.length) {
  try {
    // Determine the path to the service account key
    const serviceAccountPath = path.resolve(process.cwd(), 'firebase-admin.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      initialized = true;
      console.log("Firebase Admin SDK initialized successfully.");
    } else {
      console.error("CRITICAL: 'firebase-admin.json' not found in the project root. The Admin SDK could not be initialized.");
    }
  } catch (error) {
    console.error("CRITICAL: Error initializing Firebase Admin SDK.", error);
  }
} else {
  initialized = true;
}

// Export a getter for the db to ensure it's only accessed if initialized
function getAdminDb() {
  if (!initialized) {
    throw new Error("Firebase Admin SDK not initialized. Check server logs for details.");
  }
  return admin.firestore();
}

const adminDb = initialized ? getAdminDb() : null!; // Use null! to satisfy TS, but runtime check will throw
const adminAuth = initialized ? admin.auth() : null!;
const adminStorage = initialized ? admin.storage() : null!;


export { adminDb, adminAuth, adminStorage };
