
'use client';

import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, ArrowRight } from 'lucide-react';
import { fetchAllNotifications, type UnifiedNotification } from "@/services/notifications";
import { Badge } from './ui/badge';
import Link from 'next/link';

// Helper to assign a badge color based on the notification category
const getCategoryBadgeVariant = (category: UnifiedNotification['category']) => {
    switch(category) {
        case "Exam Alert": return "destructive";
        case "University Update": return "default";
        case "Content Update": return "secondary";
        case "Job Notification": return "default";
        case "PCI Circular": return "secondary";
        case "Industry Hiring": return "default";
        default: return "outline";
    }
}


export function NotificationPopover() {
    const [notifications, setNotifications] = useState<UnifiedNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch notifications only when the popover is opened for the first time
        if (isOpen && notifications.length === 0 && isLoading) {
            fetchAllNotifications()
                .then(data => {
                    setNotifications(data);
                })
                .catch(err => {
                    console.error("Failed to fetch notifications for popover:", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen, notifications.length, isLoading]);
    
    const recentNotifications = notifications.slice(0, 3);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                         <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                            The latest announcements and updates.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        {isLoading ? (
                             <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : recentNotifications.length > 0 ? (
                            recentNotifications.map(item => (
                                <div key={item.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:pb-0">
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                                    <div className="grid gap-1">
                                        <p className="text-sm font-medium leading-none">{item.title}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                             <Badge variant={getCategoryBadgeVariant(item.category)} className="text-xs">{item.category}</Badge>
                                             <time className="text-xs text-muted-foreground">{item.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</time>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-center text-muted-foreground p-4">No new notifications right now.</p>
                        )}
                    </div>
                     <Button variant="ghost" asChild>
                        <Link href="/dashboard/notifications">
                            View all notifications
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
