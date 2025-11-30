
"use client";

import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function AdminAccess() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function verifyCode() {
    setLoading(true);
    setError("");

    try {
      const adminRef = doc(db, "adminConfig", "main");
      const snap = await getDoc(adminRef);

      if (!snap.exists()) {
        setError("Admin config not found!");
        setLoading(false);
        return;
      }

      const adminCode = snap.data().adminCode;
      if (code === adminCode) {
        sessionStorage.setItem("A2G_ADMIN_KEY", code);
        sessionStorage.setItem("A2G_ADMIN", "ACTIVE");
        router.push("/adminarvindsharma/dashboard");
      } else {
        setError("Invalid admin access code.");
      }
    } catch (err) {
      console.error(err);
      setError("Error verifying admin code.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-3">Admin Access (Hidden)</h2>

      <input
        className="w-full border p-3 rounded mb-3"
        type="password"
        placeholder="Enter access code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && verifyCode()}
      />

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <button
        onClick={verifyCode}
        disabled={loading || code.length < 5}
        className="w-full bg-purple-500 text-white py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      <button
        onClick={() => setCode("")}
        className="w-full mt-2 p-2 rounded border"
      >
        Clear
      </button>

      <p className="mt-3 text-xs opacity-60">
        Admin URL: /adminarvindsharma — keep it private.
      </p>
    </div>
  );
}
