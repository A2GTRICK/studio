
'use client';
import { initializeApp, FirebaseApp, getApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// These are imported from the files you created
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';


const firebaseConfig = {
    apiKey: "AIzaSyAj5hjPVD5klr6galuSkk0gdZ8Wd7l66l8",
    authDomain: "a2g-smart-notes-1st.firebaseapp.com",
    databaseURL: "https://a2g-smart-notes-1st-default-rtdb.firebaseio.com",
    projectId: "a2g-smart-notes-1st",
    storageBucket: "a2g-smart-notes-1st.appspot.com",
    messagingSenderId: "593098306784",
    appId: "1:593098306784:web:bbf1511a890e423c0e4c85"
};

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

let firebaseInstances: FirebaseInstances | null = null;

export function initializeFirebase(): FirebaseInstances {
  if (firebaseInstances) {
    return firebaseInstances;
  }
  
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    firebaseInstances = { app, auth, db };
  } else {
    const app = getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    firebaseInstances = { app, auth, db };
  }
  return firebaseInstances;
}
