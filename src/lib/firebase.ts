// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration is now hardcoded here to resolve environment variable issues.
const firebaseConfig = {
  apiKey: "AIzaSyAUl7KMIEc5XDsnIGmmkiclGcz5ncKVXYs",
  authDomain: "a2g-smart-notes-fnz4e.firebaseapp.com",
  projectId: "a2g-smart-notes-fnz4e",
  storageBucket: "a2g-smart-notes-fnz4e.appspot.com",
  messagingSenderId: "287880847881",
  appId: "1:287880847881:web:f178409a464922c309ced8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export { app, db, auth };
