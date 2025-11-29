
// src/app/admin/page.tsx
"use client";
import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="p-4 border rounded shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg">Users</h3>
            <p className="text-sm text-gray-600">Manage user roles and permissions.</p>
        </Link>
        <Link href="/admin/notes" className="p-4 border rounded shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg">Notes Manager</h3>
            <p className="text-sm text-gray-600">Edit, publish, and delete notes.</p>
        </Link>
        <Link href="/admin/mcqs" className="p-4 border rounded shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg">MCQ Manager</h3>
            <p className="text-sm text-gray-600">Manage MCQ sets and questions.</p>
        </Link>
      </div>

      <section className="p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold text-gray-800">Quick Actions</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors" onClick={() => location.href="/admin/seed"}>Seed Sample Data</button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors" onClick={() => location.href="/admin/stats"}>View Stats</button>
        </div>
      </section>
    </div>
  );
}
