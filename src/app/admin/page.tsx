// src/app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/lib/firebase";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }
      
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setAllowed(data.role === "admin");
        } else {
          setAllowed(false);
        }
      } catch(error) {
        console.error("Error fetching user role:", error);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!allowed) return <div className="p-6">Access denied. Admins only.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600">Manage notes, users, announcements and content.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="/admin/users" className="p-4 bg-white border rounded">Manage Users</a>
        <a href="/admin/notes" className="p-4 bg-white border rounded">Manage Notes</a>
        <a href="/admin/announcements" className="p-4 bg-white border rounded">Announcements</a>
      </div>
    </div>
  );
}
