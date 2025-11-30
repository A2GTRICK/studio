
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

/**
 * AppUser - extend as needed (matches your users collection fields)
 */
export type AppUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: string | null;
  isPremium?: boolean | null;
  college?: string | null;
  year?: string | null;
  // add other custom fields from your users documents if needed
};

type AuthContextValue = {
  firebaseUser: FirebaseUser | null;
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  firebaseUser: null,
  user: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (!u) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // read the user's document from 'users' collection (if exists)
        const userDocRef = doc(db, "users", u.uid);
        const snap = await getDoc(userDocRef);

        if (snap.exists()) {
          const data = snap.data() as any;
          const appUser: AppUser = {
            uid: u.uid,
            email: u.email ?? null,
            displayName: u.displayName ?? null,
            photoURL: u.photoURL ?? null,
            role: data.role ?? null,
            isPremium: data.isPremium ?? false,
            college: data.college ?? null,
            year: data.year ?? null,
          };
          setUser(appUser);

          // simple admin check: you may improve (e.g., role === 'admin' or a list)
          setIsAdmin(Boolean(appUser.role === "admin" || appUser.email === "sharmaarvind28897@gmail.com"));
        } else {
          // no user doc -> create lightweight local user object
          setUser({
            uid: u.uid,
            email: u.email ?? null,
            displayName: u.displayName ?? null,
            photoURL: u.photoURL ?? null,
            isPremium: false,
          });
          setIsAdmin(Boolean(u.email === "sharmaarvind28897@gmail.com"));
        }
      } catch (err) {
        console.error("Failed fetching user doc:", err);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
