
"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Bell } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

interface NotificationItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  createdAt: Timestamp;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = [
    "All",
    "Job Notification",
    "Industry Hiring",
    "University Update",
  ];

  useEffect(() => {
    const q = query(
      collection(db, "custom_notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as NotificationItem[];

      setNotifications(items);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesCategory =
        selectedCategory === "All" || n.category === selectedCategory;

      const matchesSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.summary.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [notifications, selectedCategory, search]);

  const categoryIcon = {
    "Job Notification": "/icons/job.png",
    "Industry Hiring": "/icons/hiring.png",
    "University Update": "/icons/university.png",
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Live Notifications
        </h1>
        <p className="text-gray-600">
          The latest university updates, exam alerts, and job openings.
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white shadow-sm border p-4 rounded-xl flex gap-3 items-center">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search notifications..."
          className="w-full outline-none text-gray-700"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={clsx(
              "px-4 py-2 text-sm rounded-full border transition font-medium whitespace-nowrap",
              selectedCategory === cat
                ? "bg-purple-600 text-white border-purple-600 shadow"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow-sm border rounded-xl p-4"
          >
            <button
              className="w-full flex items-center justify-between"
              onClick={() =>
                setExpanded(expanded === item.id ? null : item.id)
              }
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-purple-600">
                    {item.category}
                    {" • "}
                    {item.createdAt.toDate().toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              <ChevronDown
                className={clsx(
                  "h-5 w-5 text-gray-600 transition-transform",
                  expanded === item.id ? "rotate-180" : ""
                )}
              />
            </button>

            {/* Expandable summary */}
            <AnimatePresence>
              {expanded === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 text-gray-700 text-sm leading-relaxed"
                >
                  {item.summary}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No matching notifications found.
          </div>
        )}
      </div>
    </div>
  );
}
