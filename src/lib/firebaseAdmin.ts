import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * IMPORTANT:
 * Firebase Admin must NOT initialize during Next.js build
 */
const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  (process.env.NODE_ENV === "development" && !process.env.FIREBASE_CONFIG);

if (!getApps().length && !isBuildTime) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
    }),
  });
}

export const adminDb = !isBuildTime ? getFirestore() : null;
export const adminStorage = !isBuildTime ? getStorage() : null;
