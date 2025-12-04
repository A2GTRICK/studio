"use client";
import { useEffect } from "react";

export default function AdminLogout() {
  useEffect(() => {
    (async () => {
      await fetch("/api/a2gadmin/logout", { method: "POST", credentials: "include" });
      window.location.href = "/a2gadmin/login";
    })();
  }, []);
  return <div className="p-6">Logging out…</div>;
}