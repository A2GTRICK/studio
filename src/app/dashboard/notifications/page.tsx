// src/app/dashboard/notifications/page.tsx
import { fetchAllNotifications } from '@/services/notifications';
import Link from 'next/link';

export default async function NotificationsPage() {
  const notifications = await fetchAllNotifications();

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live Notifications</h1>
        <p className="text-sm text-muted-foreground">The latest university updates, exam alerts and job openings.</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 && (
          <div className="p-6 bg-white rounded-xl shadow">No notifications available.</div>
        )}

        {notifications.map((n) => (
          <article key={n.id} className="p-6 bg-white rounded-xl shadow">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-semibold">{n.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{n.summary}</p>
                {n.link && (
                  <div className="mt-3">
                    <a href={n.link} className="text-sm text-purple-600 hover:underline" target="_blank" rel="noreferrer">View source</a>
                  </div>
                )}
              </div>
              <div className="text-right text-xs text-gray-400">
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