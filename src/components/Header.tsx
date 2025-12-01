// src/components/Header.tsx
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NotificationPopover from './notification-popover';

const navLinks = [
    { href: '/dashboard/notes', label: 'Notes' },
    { href: '/dashboard/mcq-practice', label: 'MCQ Practice' },
    { href: '/dashboard/services', label: 'Services' },
    { href: '/dashboard/notifications', label: 'Notifications' },
    { href: '/dashboard/about', label: 'About' },
    { href: '/dashboard/help', label: 'Help' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-extrabold text-gray-900">
              pharmA2G
            </Link>
            <nav className="hidden md:flex gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={cn(
                    "text-sm font-medium transition-colors",
                    pathname.startsWith(link.href)
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
             <NotificationPopover />
          </div>
        </div>
      </div>
    </header>
  );
}
