import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAj5hjPVD5klr6galuSkk0gdZ8Wd7l66l8",
  authDomain: "a2g-smart-notes-1st.firebaseapp.com",
  databaseURL: "https://a2g-smart-notes-1st-default-rtdb.firebaseio.com",
  projectId: "a2g-smart-notes-1st",
  storageBucket: "a2g-smart-notes-1st.firebasestorage.app",
  messagingSenderId: "593098306784",
  appId: "1:593098306784:web:e534cab5ec68ae820e4c85",
  measurementId: "G-Z2K1QYDZR9"
};

// 1. Initialize Firebase only if it hasn't been initialized already
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Safely initialize Analytics (only in the browser)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firestore offline persistence enabled");
    })
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time.
        console.warn("Firestore offline persistence failed: Multiple tabs open.");
      } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn("Firestore offline persistence failed: Browser does not support it.");
      }
    });
} catch (e) {
  console.error("Error enabling Firestore offline persistence", e);
}

export { app, analytics, auth, db, storage };