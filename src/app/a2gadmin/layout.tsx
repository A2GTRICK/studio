"use client";
import React from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold">A2GTRICK Admin</h2>
        </div>
        <nav className="flex flex-col gap-2">
          <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/a2gadmin">Dashboard</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/a2gadmin/tests">Tests</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/a2gadmin/notifications">Notifications</Link>
          <Link className="px-3 py-2 rounded hover:bg-gray-100" href="/a2gadmin/login">Logout</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}