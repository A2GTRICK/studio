"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  BookOpen,
  Layers,
  Bell,
  Menu,
  X,
  FileText,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: <Home size={18} />,
    href: "/dashboard",
  },
  {
    name: "Notes Library",
    icon: <BookOpen size={18} />,
    href: "/dashboard/notes",
  },
  {
    name: "MCQ Practice",
    icon: <Layers size={18} />,
    href: "/dashboard/mcq-practice",
  },
  {
    name: "Academic Services",
    icon: <FileText size={18} />,
    href: "/dashboard/services",
  },
  {
    name: "Notifications",
    icon: <Bell size={18} />,
    href: "/dashboard/notifications",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Toggle for Mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-md shadow-md"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-md border-r 
          transition-all duration-300 z-40
          ${open ? "w-64" : "w-20"} 
        `}
      >
        {/* Logo section */}
        <div className="p-4 flex items-center justify-between">
          {open && (
            <h1 className="text-lg font-semibold text-purple-700">
              A2G Smart Notes
            </h1>
          )}
        </div>

        {/* Menu items */}
        <nav className="mt-4">
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`
                    flex items-center gap-3 px-4 py-3 cursor-pointer 
                    transition 
                    ${
                      active
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  {open && <span>{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
