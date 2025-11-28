// src/app/dashboard/layout.tsx
"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "🏠 Dashboard" },
    { href: "/dashboard/notes", label: "📚 Notes Library" },
    { href: "/dashboard/mcq-practice", label: "🧪 MCQ Practice" },
    { href: "/dashboard/services", label: "🎓 Academic Services" },
    { href: "/dashboard/notifications", label: "🔔 Notifications" },
    { href: "/dashboard/profile", label: "👤 Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden m-4 p-2 border rounded-lg"
        onClick={() => setOpen(!open)}
      >
        ☰ Menu
      </button>

      <div className="flex">
        
        {/* SIDEBAR */}
        <aside
          className={`${
            open ? "block" : "hidden"
          } md:block w-64 bg-white shadow-lg p-6 space-y-4`}
        >
          <h2 className="text-xl font-bold mb-4">A2G Smart Notes</h2>

          <nav className="space-y-2 text-gray-700">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block p-2 rounded-lg transition ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
