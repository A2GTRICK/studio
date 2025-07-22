import * as admin from 'firebase-admin';

// This is a server-side only file.
// Ensure you have the necessary environment variables set.

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // databaseURL: `https://<YOUR_PROJECT_ID>.firebaseio.com` // Optional: for Realtime Database
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

const getFirebaseAuth = () => admin.auth();
const getFirebaseFirestore = () => admin.firestore();

export { getFirebaseAuth, getFirebaseFirestore };
