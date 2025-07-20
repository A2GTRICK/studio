// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// This configuration is now hardcoded with the keys you provided.
export const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCjxpXINGBgKj1nJj84hEAeLdQc4kIH6YE",
  authDomain: "a2g-smart-notes-fnz4e.firebaseapp.com",
  projectId: "a2g-smart-notes-fnz4e",
  storageBucket: "a2g-smart-notes-fnz4e.appspot.com",
  messagingSenderId: "287880847881",
  appId: "1:287880847881:web:f178409a464922c309ced8"
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export { app, db, auth };
