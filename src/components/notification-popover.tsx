
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Bell, Loader2, ArrowRight } from 'lucide-react';
import { usePopper } from 'react-popper';

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

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { styles, attributes } = usePopper(buttonRef.current, popoverRef.current, {
    placement: 'bottom-end',
    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
  });

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
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-100">
        <Bell />
      </button>
      
      {isOpen && (
        <div ref={popoverRef} style={styles.popper} {...attributes.popper} className="w-96 bg-white shadow-lg rounded-xl z-50 border">
          <div className="p-4 border-b">
            <div className="font-semibold">Recent updates</div>
          </div>

          <div className="max-h-80 overflow-auto">
            {loading && (
              <div className="p-4 flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" />
                <div>Loading…</div>
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
                <div className="flex justify-between items-center gap-2">
                  <div className="font-medium text-sm flex-1">{n.title}</div>
                  <div className="text-xs text-gray-400 flex-shrink-0">{n.category}</div>
                </div>
                <div className="text-sm text-gray-600 mt-1">{n.summary?.slice(0, 160)}{n.summary && n.summary.length > 160 ? '…' : ''}</div>
                {n.link && (
                  <div className="mt-2">
                    <a className="text-xs text-purple-600 hover:underline inline-flex items-center gap-1" href={n.link} target="_blank" rel="noopener noreferrer">
                      View Source <ArrowRight className="w-3 h-3"/>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-2 border-t text-center">
            <Link href="/dashboard/notifications" onClick={() => setIsOpen(false)} className="text-sm text-purple-600 hover:underline">See all notifications</Link>
          </div>
        </div>
      )}
    </div>
  );
}
