// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

type AppUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  isPremium?: boolean;
  role?: string;
};

const AuthContext = createContext<{ user: AppUser | null; loading: boolean }>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      // try to read additional profile from Firestore users collection
      try {
        const docRef = doc(db, "users", fbUser.uid);
        const snap = await getDoc(docRef);
        const profile = snap.exists() ? (snap.data() as any) : {};
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          isPremium: !!profile.isPremium,
          role: profile.role || "student",
        });
      } catch (err) {
        console.error("[useAuth] failed to fetch user profile", err);
        setUser({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName, isPremium: false, role: "student" });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
