
// src/app/dashboard/notifications/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

type NotificationRecord = {
  id: string;
  title: string;
  summary: string;
  category: string;
  link?: string;
  createdAt: Date;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const notificationsRef = collection(db, "custom_notifications");
        const q = query(notificationsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        const fetchedNotifications = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                summary: data.summary,
                category: data.category,
                link: data.link,
                createdAt: (data.createdAt as Timestamp).toDate(),
            } as NotificationRecord;
        });
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);


  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live Notifications</h1>
        <p className="text-sm text-muted-foreground">The latest university updates, exam alerts and job openings.</p>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="p-6 bg-white rounded-xl shadow text-center text-muted-foreground">Loading notifications...</div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="p-6 bg-white rounded-xl shadow text-center text-muted-foreground">No notifications available.</div>
        )}

        {!loading && notifications.map((n) => (
          <article key={n.id} className="p-6 bg-white rounded-xl shadow-sm border">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-semibold">{n.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{n.summary}</p>
                {n.link && (
                  <div className="mt-3">
                    <a href={n.link} className="text-sm text-purple-600 hover:underline" target="_blank" rel="noreferrer noopener">View source &rarr;</a>
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-gray-400 flex-shrink-0">
                {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium' }) : '—'}
                <div className="mt-2">
                  <span className="px-2 py-1 border rounded-lg text-xs bg-gray-50">{n.category}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
