
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    notes: 0,
    mcq: 0,
    queries: 0,
    users: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      if (!db) return;
      try {
        const notesSnap = await getDocs(collection(db, "notes"));
        const mcqSnap = await getDocs(collection(db, "mcqSets"));
        const querySnap = await getDocs(collection(db, "contact_queries"));
        const userSnap = await getDocs(collection(db, "users"));

        setStats({
          notes: notesSnap.size,
          mcq: mcqSnap.size,
          queries: querySnap.size,
          users: userSnap.size,
        });
      } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

        <Link
          href="/adminarvindsharma"
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow"
        >
          Logout
        </Link>
      </div>

      {/* STAT CARDS */}
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

        <div className="p-5 rounded-xl shadow bg-white border border-purple-100">
          <h3 className="text-xl font-semibold text-purple-700">📚 Notes</h3>
          <p className="text-4xl font-bold mt-2">{stats.notes}</p>
        </div>

        <div className="p-5 rounded-xl shadow bg-white border border-blue-100">
          <h3 className="text-xl font-semibold text-blue-700">🧪 MCQ Sets</h3>
          <p className="text-4xl font-bold mt-2">{stats.mcq}</p>
        </div>

        <div className="p-5 rounded-xl shadow bg-white border border-green-100">
          <h3 className="text-xl font-semibold text-green-700">👥 Users</h3>
          <p className="text-4xl font-bold mt-2">{stats.users}</p>
        </div>

        <div className="p-5 rounded-xl shadow bg-white border border-pink-100">
          <h3 className="text-xl font-semibold text-pink-700">📩 Queries</h3>
          <p className="text-4xl font-bold mt-2">{stats.queries}</p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <h2 className="text-xl font-semibold text-gray-700 mb-3">Quick Actions</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">

        <Link
          href="/adminarvindsharma/upload-notes"
          className="block bg-white hover:bg-purple-50 border border-purple-200 p-5 rounded-xl shadow transition"
        >
          <h3 className="text-lg font-semibold text-purple-700">➕ Upload Notes</h3>
          <p className="text-sm text-gray-600">Add new study notes.</p>
        </Link>

        <Link
          href="/adminarvindsharma/upload-mcq"
          className="block bg-white hover:bg-blue-50 border border-blue-200 p-5 rounded-xl shadow transition"
        >
          <h3 className="text-lg font-semibold text-blue-700">🧪 Upload MCQ Set</h3>
          <p className="text-sm text-gray-600">Create new practice questions.</p>
        </Link>

        <Link
          href="/adminarvindsharma/config"
          className="block bg-white hover:bg-green-50 border border-green-200 p-5 rounded-xl shadow transition"
        >
          <h3 className="text-lg font-semibold text-green-700">⚙ Admin Config</h3>
          <p className="text-sm text-gray-600">Update admin key & settings.</p>
        </Link>
      </div>

      {/* SYSTEM STATUS */}
      <h2 className="text-xl font-semibold text-gray-700 mb-3">System Status</h2>
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow">
        <p className="text-green-600 font-medium">✓ Admin Code Active</p>
        <p className="text-green-600 font-medium mt-1">✓ Database Connected</p>
      </div>
    </div>
  );
}
