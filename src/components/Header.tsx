// src/components/Header.tsx
"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, doc, getDoc, type Firestore } from "firebase/firestore";
import app from "@/firebase/config";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);

  useEffect(() => {
    if (app) {
      const authInstance = getAuth(app);
      const dbInstance = getFirestore(app);
      setAuth(authInstance);
      setDb(dbInstance);

      const unsub = onAuthStateChanged(authInstance, async (u) => {
        if (u) {
          setUser(u);
          // fetch role from Firestore users collection
          try {
            const d = await getDoc(doc(dbInstance, "users", u.uid));
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
    }
  }, []);

  async function handleSignIn() {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      console.error(e);
      alert("Sign-in failed");
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    await signOut(auth);
  }

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/" className="text-xl font-bold">phamA2G</a>
          <nav className="hidden md:flex gap-3 text-sm text-slate-600">
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/dashboard/notes" className="hover:underline">Notes</a>
            <a href="/dashboard/mcq-practice" className="hover:underline">MCQ Practice</a>
            <a href="/dashboard/services" className="hover:underline">Services</a>
            <a href="/dashboard/about" className="hover:underline">About</a>
            <a href="/dashboard/help" className="hover:underline">Help</a>
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
