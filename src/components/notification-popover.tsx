"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  createdAt: any;
}

export default function NotificationPopover() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "custom_notifications"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationItem[];

      setNotifications(items.slice(0, 5)); // show top 5
    });

    return () => unsub();
  }, []);

  const categoryColor: Record<string, string> = {
    "Exam Alert": "bg-red-500/10 text-red-600",
    "Job Notification": "bg-blue-500/10 text-blue-700",
    "University Update": "bg-purple-500/10 text-purple-700",
    "PCI Circular": "bg-amber-500/10 text-amber-700",
    "Industry Hiring": "bg-green-500/10 text-green-700",
    General: "bg-gray-300/20 text-gray-700",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <div className="relative cursor-pointer">
          <Bell className="h-6 w-6 text-gray-700 hover:text-black transition" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        className="w-96 rounded-xl shadow-xl border border-gray-200 p-0 overflow-hidden"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
          <h3 className="text-white font-semibold text-lg">Recent updates</h3>
          <p className="text-purple-100 text-xs">
            Latest announcements and notifications
          </p>
        </div>

        {/* CONTENT */}
        <div className="max-h-80 overflow-y-auto divide-y scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No new notifications right now.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-semibold text-sm text-gray-900 leading-snug">
                    {n.title}
                  </h4>

                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${categoryColor[n.category] || ""
                      }`}
                  >
                    {n.category}
                  </Badge>
                </div>

                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {n.summary}
                </p>

                <p className="text-[10px] text-gray-400 mt-2">
                  {n.createdAt?.toDate?.().toLocaleDateString("en-IN")}
                </p>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t text-center">
          <Link
            href="/dashboard/notifications"
            className="text-sm font-medium text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
          >
            See all notifications
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}