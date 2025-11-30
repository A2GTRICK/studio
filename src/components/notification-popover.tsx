// src/components/notification-popover.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Loader2, ArrowRight } from 'lucide-react';

type Notif = {
  id: string;
  title: string;
  summary: string;
  category: string;
  link?: string | null;
  createdAt?: string | null;
};

export default function NotificationPopover() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Notif[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/notifications');
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.error || 'Failed to load notifications');
          setItems([]);
        } else {
          if (!cancelled) setItems(json.notifications || []);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load notifications');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative">
      <button className="p-2 rounded-full hover:bg-gray-100">
        <Bell />
      </button>
      <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-xl z-50">
        <div className="p-4 border-b">
          <div className="font-semibold">Recent updates</div>
        </div>

        <div className="max-h-80 overflow-auto">
          {loading && (
            <div className="p-4 flex items-center gap-2">
              <Loader2 className="animate-spin" />
              <div>Loading…</div>
            </div>
          )}

          {!loading && error && (
            <div className="p-4 text-red-600">Error: {error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">No announcements currently.</div>
          )}

          {!loading && items.map((n) => (
            <div key={n.id} className="p-3 border-b hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-gray-400">{n.category}</div>
              </div>
              <div className="text-sm text-gray-700 mt-1">{n.summary?.slice(0, 160)}{n.summary && n.summary.length > 160 ? '…' : ''}</div>
              {n.link && (
                <div className="mt-2">
                  <a className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1" href={n.link} target="_blank" rel="noopener noreferrer">
                    View Source <ArrowRight className="w-3 h-3"/>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 border-t text-center">
          <Link href="/dashboard/notifications" className="text-sm text-purple-600 hover:underline">See all notifications</Link>
        </div>
      </div>
    </div>
  );
}