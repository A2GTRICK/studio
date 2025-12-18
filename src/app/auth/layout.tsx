"use client";

import React, { ReactNode } from "react";
import { FirebaseProvider, useFirebaseApp, useAuth, useFirestore } from "@/firebase/provider";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// This is a simplified client-side only initialization.
// We are NOT using the server-side config from `firebase/config.ts` here
// to avoid bundling server secrets on the client.
const firebaseConfig = {
  apiKey: "AIzaSyAj5hjPVD5klr6galuSkk0gdZ8Wd7l66l8",
  authDomain: "a2g-smart-notes-1st.firebaseapp.com",
  projectId: "a2g-smart-notes-1st",
  storageBucket: "a2g-smart-notes-1st.appspot.com",
  messagingSenderId: "593098306784",
  appId: "1:593098306784:web:e534cab5ec68ae820e4c85",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
}

function AuthFirebaseProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider app={app} auth={auth} db={db}>
      {children}
    </FirebaseProvider>
  );
}


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthFirebaseProvider>
      {children}
    </AuthFirebaseProvider>
  );
}
