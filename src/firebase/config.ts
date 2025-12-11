
// src/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🚀 Correct Firebase config (your selected Web App)
const firebaseConfig = {
  apiKey: "AIzaSyAj5hjPVD5klr6galuSkk0gdZ8Wd7l66l8",
  authDomain: "a2g-smart-notes-1st.firebaseapp.com",
  databaseURL: "https://a2g-smart-notes-1st-default-rtdb.firebaseio.com",
  projectId: "a2g-smart-notes-1st",
  storageBucket: "a2g-smart-notes-1st.appspot.com",
  messagingSenderId: "593098306784",
  appId: "1:593098306784:web:e534cab5ec68ae820e4c85",
  measurementId: "G-Z2K1QYDZR9",
};

// 🛡️ Prevent double initialization (Next.js hot reload safe)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 🔥 Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ❌ DO NOT EXPORT analytics — it breaks in SSR
// (analytics can only run in browser)

export default app;
