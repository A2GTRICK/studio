
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyA_UmQOO-k_unjL_lWFjtWuXpK_W824LsU",
  authDomain: "a2g-final-version.firebaseapp.com",
  projectId: "a2g-final-version",
  storageBucket: "a2g-final-version.appspot.com",
  messagingSenderId: "398487697373",
  appId: "1:398487697373:web:cc482234732baa42e0e834",
  measurementId: "G-89SEFZPXLS"
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
