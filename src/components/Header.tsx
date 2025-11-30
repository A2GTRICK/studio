
// src/components/Header.tsx
"use client";
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <a href="/" className="text-xl font-bold">phamA2G</a>
          <nav className="hidden md:flex gap-3 text-sm text-slate-600">
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/dashboard/notes" className="hover:underline">Notes</a>
            <a href="/dashboard/mcq-practice" className="hover:underline">MCQ Practice</a>
            <a href="/dashboard/services" className="hover:underline">Services</a>
            <a href="/dashboard/about" className="hover:underline">About</a>
            <a href="/dashboard/help" className="hover:underline">Help</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Sign-in buttons can be re-added here later if needed */}
          <Link href="/dashboard" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
