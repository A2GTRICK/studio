
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { db } from "@/firebase/config";

export default function AdminConfigPage() {
  const router = useRouter();
  const [curCode, setCurCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem("A2G_ADMIN");
    if (s !== "ACTIVE") {
        router.push("/adminarvindsharma");
        return;
    }
    
    if(!db) return;
    (async () => {
        const docRef = doc(db, "adminConfig", "main");
        getDoc(docRef)
        .then((snap) => {
             if (snap.exists()) {
                setCurCode(String(snap.data().adminCode || ""));
            }
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        });
    })();
  }, [router]);

  const handleChange = async () => {
    if (!db) {
        setStatus("Firestore is not available.");
        return;
    }
    setStatus(null);
    const adminKey = sessionStorage.getItem("A2G_ADMIN_KEY") || "";
    if (!adminKey) { setStatus("Missing admin key"); return; }
    if (!newCode) { setStatus("Enter new code"); return; }
    
    const docRef = doc(db, "adminConfig", "main");
    const updateData = { adminCode: newCode, enabled: true, adminOldKey: adminKey };

    setDoc(docRef, updateData, { merge: true })
      .then(() => {
        // update session key
        sessionStorage.setItem("A2G_ADMIN_KEY", newCode);
        setCurCode(newCode);
        setNewCode("");
        setStatus("Admin code updated.");
      })
      .catch((serverError: any) => {
        setStatus(`Update failed: Check Firestore rules for adminConfig collection.`);
         const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: updateData
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Admin Config</h2>
      <div className="p-4 bg-secondary rounded-lg">
        <div className="mb-3 text-sm">Current code: <strong>{curCode ? "••••••••" : "not set"}</strong></div>
        <input className="w-full p-3 border rounded mb-3" placeholder="New admin code" value={newCode} onChange={(e) => setNewCode(e.target.value)} type="password"/>
        <div className="flex gap-3">
          <button onClick={handleChange} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Update Code</button>
          <button onClick={() => router.push("/adminarvindsharma/dashboard")} className="px-4 py-2 border rounded-md">Back</button>
        </div>
        {status && <div className="mt-3 text-sm p-3 bg-card rounded-md">{status}</div>}
      </div>
    </div>
  );
}
