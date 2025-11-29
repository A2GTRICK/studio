"use client";

import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-10">

      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-3xl font-bold">
          {user ? `Welcome back, ${user.displayName || user.email}!` : "Welcome to A2G Smart Notes 👋"}
        </h1>
        <p className="text-gray-600 mt-1">
          Your all-in-one platform for pharmacy learning.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <a
          href="/dashboard/notes"
          className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold">📚 Notes Library</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Access organized notes from all subjects.
          </p>
        </a>

        <a
          href="/dashboard/mcq-practice"
          className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold">🧪 MCQ Practice</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Practice MCQs for GPAT, NIPER & D.Pharm.
          </p>
        </a>

        <a
          href="/dashboard/services"
          className="p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold">🎓 Academic Services</h2>
          <p className="text-gray-600 mt-2 text-sm">
            Project files, reports, dissertation help.
          </p>
        </a>

      </div>

      {/* Announcement Section */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold mb-3">📢 Latest Update</h2>
        <p className="text-gray-700 text-sm">
          New Pharmacognosy Unit 2 diagrams have been added recently.
        </p>
      </div>

    </div>
  );
}