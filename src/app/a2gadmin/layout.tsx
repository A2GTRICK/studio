"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/a2gadmin/login");
      }
      setChecking(false);
    });

    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div className="p-10 text-muted-foreground">
        Checking admin session…
      </div>
    );
  }

  return <>{children}</>;
}
