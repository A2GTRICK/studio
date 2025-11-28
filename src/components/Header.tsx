// src/components/Header.tsx
"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function Header() {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // fetch role from Firestore users collection
        try {
          const d = await getDoc(doc(db, "users", u.uid));
          if (d.exists()) {
            const data = d.data();
            setRole(data.role || null);
          } else {
            // if user doc doesn't exist, create minimal doc (client-side bootstrap)
            await fetch("/api/users/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uid: u.uid, displayName: u.displayName, email: u.email }),
            });
            setRole("student");
          }
        } catch (err) {
          console.error("role fetch error", err);
        }
      } else {
        setUser(null);
        setRole(null);
      }
    });
    return () => unsub();
  }, [auth, db]);

  async function handleSignIn() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert("Sign-in failed");
    }
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/" className="text-xl font-bold">A2G Smart Notes</a>
          <nav className="hidden md:flex gap-3 text-sm text-slate-600">
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/dashboard/notes" className="hover:underline">Notes</a>
            <a href="/dashboard/mcq-practice" className="hover:underline">MCQ Practice</a>
            <a href="/dashboard/services" className="hover:underline">Services</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {role === "admin" && (
            <a href="/admin" className="px-3 py-1 text-sm bg-yellow-100 border rounded">Admin</a>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-700">{user.displayName || user.email}</div>
              <button onClick={handleSignOut} className="px-3 py-1 border rounded text-sm">Sign out</button>
            </div>
          ) : (
            <button onClick={handleSignIn} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}
