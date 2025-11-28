
// src/lib/auth.ts
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (auth && db) {
      const unsub = onAuthStateChanged(auth, async (u) => {
        if (u) {
          setUser(u);
          try {
            const snap = await getDoc(doc(db, "users", u.uid));
            if (snap.exists()) {
              setRole((snap.data() as any).role || "student");
            } else {
              setRole("student");
            }
          } catch (err) {
            console.error("Role fetch error:", err);
            setRole("student");
          }
        } else {
          setUser(null);
          setRole(null);
        }
      });
      return () => unsub();
    }
  }, [auth, db]);

  return { user, role };
}
