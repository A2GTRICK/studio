"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Allow login page to render without admin layout
  if (pathname.startsWith("/a2gadmin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-secondary/30">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-card border-r p-5 text-card-foreground">
        <h2 className="text-2xl font-bold mb-6 text-primary">
          A2G Admin
        </h2>

        <nav className="flex flex-col gap-2">
          {[
            { label: "Dashboard", href: "/a2gadmin" },
            { label: "Notes", href: "/a2gadmin/notes" },
            { label: "MCQs", href: "/a2gadmin/mcq" },
            { label: "Tests", href: "/a2gadmin/tests" },
            { label: "Blog", href: "/a2gadmin/blog" },
            { label: "Jobs", href: "/a2gadmin/jobs" },
            { label: "Notifications", href: "/a2gadmin/notifications" },
            { label: "Users", href: "/a2gadmin/users" },
            { label: "Payments", href: "/a2gadmin/payments" },
            { label: "Settings", href: "/a2gadmin/settings" },
          ].map((nav) => (
            <Link
              key={nav.href}
              href={nav.href}
              className={`px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                pathname.startsWith(nav.href)
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-secondary"
              }`}
            >
              {nav.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 text-foreground">
        <div className="bg-card border rounded-xl p-4 mb-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-wide">
            A2G Admin Panel
          </h1>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
