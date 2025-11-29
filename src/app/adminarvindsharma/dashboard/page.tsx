"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function useAdmin() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    // This code runs only on the client
    const s = sessionStorage.getItem("A2G_ADMIN");
    setOk(s === "ACTIVE");
  }, []);
  return ok;
}

export default function AdminDashboard() {
  const ok = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // This effect also runs only on the client
    if (!ok && typeof window !== 'undefined') {
        // A short delay to allow the `useAdmin` hook to run first
        setTimeout(() => {
            const s = sessionStorage.getItem("A2G_ADMIN");
            if (s !== "ACTIVE") {
                 router.push("/adminarvindsharma");
            }
        }, 100);
    }
  }, [ok, router]);

  if (!ok) return <div className="p-6">Checking admin session...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div>
          <button
            className="px-3 py-1 border rounded mr-2"
            onClick={() => {
              sessionStorage.removeItem("A2G_ADMIN");
              sessionStorage.removeItem("A2G_ADMIN_KEY");
              router.push("/adminarvindsharma");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/adminarvindsharma/upload-notes" className="p-4 rounded-lg border shadow-sm hover:shadow">
          Upload Notes
        </Link>
        <Link href="/adminarvindsharma/upload-mcq" className="p-4 rounded-lg border shadow-sm hover:shadow">
          Upload MCQ Set
        </Link>
        <Link href="/adminarvindsharma/config" className="p-4 rounded-lg border shadow-sm hover:shadow">
          Admin Config (edit admin code)
        </Link>
      </div>
    </div>
  );
}
