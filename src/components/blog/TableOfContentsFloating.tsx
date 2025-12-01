'use client';
import { useState, useEffect } from 'react';
import { X, List } from 'lucide-react';

type Heading = { id: string; text: string; level: number };

export default function TableOfContentsFloating({ headings }: { headings: Heading[] }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < 200);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!headings || headings.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Open table of contents"
        onClick={() => setOpen(true)}
        className={`fixed z-50 right-5 bottom-5 md:bottom-8 flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-transform ${visible ? 'scale-100' : 'scale-90'} bg-gradient-to-br from-primary to-violet-600 text-white`}
      >
        <List className="h-6 w-6" />
      </button>

      {/* Slide-up panel */}
      <div
        className={`fixed z-50 left-0 right-0 bottom-0 md:left-auto md:right-5 md:bottom-20 transform transition-transform ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxWidth: '420px', marginLeft: 'auto' }}
      >
        <div className="bg-white rounded-t-xl shadow-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Table of contents</h3>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="max-h-64 overflow-y-auto space-y-2 text-sm">
            {headings.map(h => (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={() => setOpen(false)}
                className={`block scroll-smooth hover:text-primary ${h.level === 1 ? 'font-medium' : 'pl-3 text-muted-foreground'}`}
              >
                {h.text}
              </a>
            ))}
          </nav>

          <div className="mt-3 text-xs text-muted-foreground">
            <span>Tap an item to jump there</span>
          </div>
        </div>
      </div>
    </>
  );
}
