'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bell, Send } from 'lucide-react';
import { SVGProps } from 'react';

const WhatsAppIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.357 1.849 6.069l-1.104 4.053 4.144-1.088z" />
  </svg>
);

const socialLinks = {
  notifications: '/dashboard/notifications',
  telegram: 'https://t.me/a2gtrickacademy',
  whatsapp: 'https://whatsapp.com/channel/0029VafwdunEKyZOy2acO41A',
};

export default function StayUpdatedStrip() {
  return (
    <div className="bg-white border border-primary/20 rounded-xl shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="text-center md:text-left">
        <h4 className="font-semibold text-primary">Stay Updated with Exam Alerts</h4>
        <p className="text-sm text-muted-foreground mt-1">
          Get free access to exam news, job alerts, and result notifications.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button asChild variant="outline">
          <Link href={socialLinks.notifications}>
            <Bell className="mr-2 h-4 w-4" />
            App Alerts
          </Link>
        </Button>
        <Button asChild variant="outline">
          <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer">
            <Send className="mr-2 h-4 w-4" />
            Telegram
          </a>
        </Button>
        <Button asChild variant="outline">
          <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="mr-2 h-4 w-4" />
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
