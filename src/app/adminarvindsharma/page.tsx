"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminEntryPage() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const db = getFirestore(app);

  const verify = async () => {
    setErr(null);
    setLoading(true);
    
    const cfgRef = doc(db, "adminConfig", "main");

    getDoc(cfgRef).then(snap => {
      if (!snap.exists()) {
        setErr("Admin config not found in Firestore.");
        setLoading(false);
        return;
      }
      const data = snap.data() as any;
      if (!data.enabled) {
        setErr("Admin panel is currently disabled.");
        setLoading(false);
        return;
      }
      const real = String(data.adminCode || "");
      if (code.trim() === real) {
        // success — store session key
        sessionStorage.setItem("A2G_ADMIN", "ACTIVE");
        sessionStorage.setItem("A2G_ADMIN_KEY", real); // store adminKey for uploads
        router.push("/adminarvindsharma/dashboard");
      } else {
        setErr("Invalid admin code.");
      }
    }).catch(serverError => {
       const permissionError = new FirestorePermissionError({
          path: cfgRef.path,
          operation: 'get',
      });
      errorEmitter.emit('permission-error', permissionError);
      console.error(serverError); // Also log original error
      setErr("Verification failed. Check permissions in console.");
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Admin Access (Hidden)</h2>
        <p className="text-sm text-gray-600 mb-4">Enter admin access code to open the panel.</p>

        {err && <div className="mb-3 text-red-600 text-sm">{err}</div>}

        <input
          className="w-full p-3 border rounded mb-3"
          placeholder="Admin access code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          type="password"
        />

        <div className="flex gap-2">
          <button onClick={verify} disabled={loading} className="flex-1 py-2 bg-primary text-primary-foreground rounded-md">
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button onClick={() => (setCode(""), setErr(null))} className="px-4 py-2 border rounded-md">
            Clear
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">Admin URL: /adminarvindsharma — keep it private.</p>
      </div>
    </div>
  );
}
