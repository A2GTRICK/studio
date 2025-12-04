'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ❗ Do NOT apply admin layout on login page
  if (pathname.startsWith("/a2gadmin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-600 via-indigo-700 to-black relative overflow-hidden">

      <div className="absolute inset-0 backdrop-blur-xl bg-black/20 z-0"></div>

      {/* Sidebar */}
      <aside className="relative z-10 w-64 hidden md:flex flex-col backdrop-blur-2xl bg-white/10 border-r border-white/20 p-5 text-white">
        <h2 className="text-2xl font-bold mb-6 tracking-wide bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          A2G Admin
        </h2>

        <nav className="flex flex-col gap-2">
          {[
            { label: "Dashboard", href: "/a2gadmin" },
            { label: "Notes", href: "/a2gadmin/notes" },
            { label: "Tests", href: "/a2gadmin/tests" },
            { label: "Blog", href: "/a2gadmin/blog" },
            { label: "Jobs", href: "/a2gadmin/jobs" },
            { label: "Notifications", href: "/a2gadmin/notifications" },
            { label: "Users", href: "/a2gadmin/users" },
            { label: "Settings", href: "/a2gadmin/settings" },
          ].map((nav) => (
            <Link
              key={nav.href}
              href={nav.href}
              className={`px-3 py-2 rounded-lg transition-all ${
                pathname === nav.href
                  ? "bg-white/20 font-semibold shadow-md"
                  : "hover:bg-white/10"
              }`}
            >
              {nav.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="relative z-10 flex-1 p-6 text-white">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 mb-6 shadow-xl">
          <h1 className="text-xl font-semibold tracking-wide">A2G Admin Panel</h1>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 shadow-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
