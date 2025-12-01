'use client';
import { useState } from 'react';
import { Facebook, Linkedin, Whatsapp, Send } from 'lucide-react';

export default function ShareButtons({ title, url }: { title: string; url: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareTargets = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${encodedUrl}`,
      icon: <Whatsapp className="h-4 w-4" />
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <Send className="h-4 w-4" />
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <Facebook className="h-4 w-4" />
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <Linkedin className="h-4 w-4" />
    }
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Share</span>
      <div className="flex gap-2">
        {shareTargets.map(t => (
          <a
            key={t.name}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-9 px-3 rounded-md border hover:shadow-sm hover:bg-muted/5"
            title={`Share on ${t.name}`}
          >
            {t.icon}
            <span className="sr-only">{t.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
