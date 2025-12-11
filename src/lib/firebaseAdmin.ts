/**
 * SAFE & LAZY Firebase Admin Initialization
 *
 * This file ensures the Admin SDK is initialized only once, and not during the build process.
 * It reads environment variables at runtime, which is required for Firebase App Hosting.
 */
import * as admin from "firebase-admin";

// Store a singleton instance
let app: admin.app.App;

function initializeAdminApp() {
  if (app) {
    return app;
  }

  // These are automatically provided by Firebase App Hosting at runtime
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey) {
    // This will only be a problem at runtime if secrets aren't set, not during build.
    // In a deployed App Hosting environment, these are guaranteed to be present.
    console.warn("Firebase Admin environment variables are not fully set. This is expected during local development without a .env.local file, but will fail in production if not configured.");
    
    // Fallback for local dev if no env vars
    if (admin.apps.length > 0) {
      app = admin.app();
      return app;
    } else {
       throw new Error("Firebase Admin environment variables are not set and no default app is initialized.");
    }
  }

  if (admin.apps.length > 0) {
      app = admin.app();
  } else {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
  }

  return app;
}


// LAZY GETTERS
// Use these functions in your API routes instead of direct imports.

export function getAdminDb() {
  initializeAdminApp();
  return admin.firestore();
}

export function getAdminAuth() {
  initializeAdminApp();
  return admin.auth();
}

export function getAdminStorage() {
    initializeAdminApp();
    return admin.storage();
}

// For cases where you might need the raw admin object
export function getAdmin() {
    initializeAdminApp();
    return admin;
}
