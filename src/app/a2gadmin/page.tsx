// src/app/a2gadmin/page.tsx
"use client";

import Link from "next/link";
import {
  Users,
  FileText,
  ListChecks,
  BookOpen,
  PlusCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Users",
      value: "12,540",
      icon: Users,
    },
    {
      label: "Total Notes",
      value: "346",
      icon: FileText,
    },
    {
      label: "MCQ Sets",
      value: "58",
      icon: ListChecks,
    },
    {
      label: "Blog Posts",
      value: "42",
      icon: BookOpen,
    },
  ];

  const quickActions = [
    {
      label: "Add New Note",
      href: "/a2gadmin/notes/create",
    },
    {
      label: "Create MCQ Set",
      href: "/a2gadmin/mcq/create",
    },
    {
      label: "Write Blog Post",
      href: "/a2gadmin/blog/create",
    },
    {
      label: "Add Job Update",
      href: "/a2gadmin/jobs/create",
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of platform activity and quick controls
        </p>
      </div>

      {/* ANALYTICS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {item.label}
                </div>
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="mt-3 text-3xl font-bold text-primary">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

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
              <PlusCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition" />
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