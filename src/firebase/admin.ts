import { getApps, initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const app =
  getApps().length === 0
    ? initializeApp({
        credential: applicationDefault(),
        storageBucket: "a2g-smart-notes-1st.appspot.com",
      })
    : getApps()[0];

export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);