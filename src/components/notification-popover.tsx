
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Loader2, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


type Notif = {
  id: string;
  title: string;
  summary: string;
  category: string;
  link?: string | null;
  createdAt?: string | null;
};

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Notif[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
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
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full hover:bg-gray-100"
        >
          <Bell />
          {items.length > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
         <div className="p-4 border-b">
            <div className="font-semibold text-foreground">Recent updates</div>
          </div>

          <div className="max-h-80 overflow-auto">
            {loading && (
              <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin h-4 w-4" />
                <div>Loading notifications...</div>
              </div>
            )}

            {!loading && error && (
              <div className="p-4 text-red-600 text-center">Error: {error}</div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">No announcements currently.</div>
            )}

            {!loading && !error && items.map((n) => (
              <div key={n.id} className="p-3 border-b hover:bg-gray-50/50">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-medium text-sm flex-1">{n.title}</div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">{n.category}</div>
                </div>
                <div className="text-sm text-muted-foreground mt-1 pr-4">
                    {n.summary?.slice(0, 160)}{n.summary && n.summary.length > 160 ? '...' : ''}
                    {n.link && (
                        <a className="text-xs text-primary hover:underline inline-flex items-center gap-1 ml-2" href={n.link} target="_blank" rel="noopener noreferrer">
                            More <ArrowRight className="w-3 h-3"/>
                        </a>
                    )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t text-center">
            <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)} className="text-sm text-primary font-medium hover:underline">See all notifications</Link>
          </div>
      </PopoverContent>
    </Popover>
  );
}
