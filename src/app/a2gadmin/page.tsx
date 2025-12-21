
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  FileText,
  ListChecks,
  BookOpen,
  PlusCircle,
  Loader2,
} from "lucide-react";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    notes: 0,
    mcq: 0,
    blogs: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          usersSnap,
          notesSnap,
          mcqSnap,
          blogSnap,
        ] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "notes")),
          getDocs(collection(db, "mcqSets")),
          getDocs(collection(db, "posts")),
        ]);

        setStats({
          users: usersSnap.size,
          notes: notesSnap.size,
          mcq: mcqSnap.size,
          blogs: blogSnap.size,
        });
      } catch (err) {
        console.error("Admin stats load failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const cards = [
    {
      label: "Total Users",
      value: stats.users,
      icon: Users,
    },
    {
      label: "Total Notes",
      value: stats.notes,
      icon: FileText,
    },
    {
      label: "MCQ Sets",
      value: stats.mcq,
      icon: ListChecks,
    },
    {
      label: "Blog Posts",
      value: stats.blogs,
      icon: BookOpen,
    },
  ];

  const quickActions = [
    { label: "Add New Note", href: "/a2gadmin/notes/create" },
    { label: "Create MCQ Set", href: "/a2gadmin/mcq/create" },
    { label: "Write Blog Post", href: "/a2gadmin/blog/create" },
    { label: "Add Job Update", href: "/a2gadmin/jobs/create" },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live overview of platform data
        </p>
      </div>

      {/* STATS */}
      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-card border rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {item.label}
                  <Icon className="w-5 h-5" />
                </div>

                <div className="mt-3 text-3xl font-bold text-primary">
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="group bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              <span className="font-medium">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
