// src/lib/auth.ts
"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export function useUserProfile() {
  const [user, setUser] = useState<any>(null);
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
            setRole("student");
          }
        } else {
          setUser(null);
          setRole(null);
        }
      });
      return () => unsub();
    }
  }, []);

  return { user, role };
}
