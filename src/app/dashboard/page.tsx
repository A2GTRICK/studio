"use client";
import { useEffect } from "react";
import { useUserProfile } from "@/lib/auth";

export default function DashboardPage() {
  const { user, role } = useUserProfile();

  useEffect(() => {
    // you can add analytics or fetch more data here
  }, [user]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {user ? `Welcome back, ${user.displayName || user.email}` : "Welcome to A2G Smart Notes 👋"}
      </h1>
      <p className="text-gray-600">Your Pharmacy Learning Dashboard</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

        <a href="/dashboard/notes" className="p-5 bg-white border rounded-xl shadow hover:bg-gray-50">
          <h2 className="text-lg font-semibold">📚 Notes Library</h2>
          <p className="text-gray-600 text-sm">View saved or uploaded notes</p>
        </a>

        <a href="/dashboard/mcq-practice" className="p-5 bg-white border rounded-xl shadow hover:bg-gray-50">
          <h2 className="text-lg font-semibold">🧪 MCQ Practice</h2>
          <p className="text-gray-600 text-sm">Practice exam questions</p>
        </a>

        <a href="/dashboard/services" className="p-5 bg-white border rounded-xl shadow hover:bg-gray-50">
          <h2 className="text-lg font-semibold">🎓 Academic Services</h2>
          <p className="text-gray-600 text-sm">Projects, reports & assignments</p>
        </a>

      </div>
    </div>
  );
}
