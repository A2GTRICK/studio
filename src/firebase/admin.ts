
import * as admin from 'firebase-admin';

// Ensure the app is not already initialized to prevent errors.
if (!admin.apps.length) {
  try {
    // initializeApp will automatically use configured service accounts
    // or GOOGLE_APPLICATION_CREDENTIALS environment variables.
    admin.initializeApp();
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}

export const adminDb = admin.firestore();
