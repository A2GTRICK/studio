// src/lib/auth.ts
"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export function useUserProfile() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
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
  }, []);

  return { user, role };
}
