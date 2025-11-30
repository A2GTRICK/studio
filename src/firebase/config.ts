// src/firebase/config.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase web config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAj5hjPVD5klr6galuSkk0gdZ8Wd7l66l8",
  authDomain: "a2g-smart-notes-1st.firebaseapp.com",
  databaseURL: "https://a2g-smart-notes-1st-default-rtdb.firebaseio.com",
  projectId: "a2g-smart-notes-1st",
  storageBucket: "a2g-smart-notes-1st.appspot.com",
  messagingSenderId: "593098306784",
  appId: "1:593098306784:web:bbf1511a890e423c0e4c85",
};

// Prevent duplicate initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
