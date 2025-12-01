
// src/app/dashboard/notifications/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Loader2, Bell, BookCopy, Briefcase, Building, AlertCircle, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type NotificationRecord = {
  id: string;
  title: string;
  summary: string;
  category: string;
  link?: string;
  createdAt: Date;
};

const categoryIcons: Record<string, React.ReactNode> = {
    "Exam Alert": <AlertCircle className="h-5 w-5 text-red-500" />,
    "Job Notification": <Briefcase className="h-5 w-5 text-blue-500" />,
    "University Update": <Building className="h-5 w-5 text-purple-500" />,
    "Content Update": <BookCopy className="h-5 w-5 text-green-500" />,
    "PCI Circular": <Info className="h-5 w-5 text-yellow-600" />,
    "General": <Info className="h-5 w-5 text-gray-500" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
        setLoading(false);
        return;
    }
    const notificationsRef = collection(db, "custom_notifications");
    const q = query(notificationsRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
        setLoading(false);
    }, (error) => {
        console.error("Failed to fetch notifications:", error);
        const permissionError = new FirestorePermissionError({
            path: 'custom_notifications',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-4">
                <Bell className="w-8 h-8" />
            </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-gray-900">
            Live Notifications
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
            The latest university updates, exam alerts, and job openings.
          </p>
        </header>

      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed">
            <h2 className="text-2xl font-semibold text-gray-700">No Notifications Yet</h2>
            <p className="mt-2 text-muted-foreground">Check back soon for new announcements!</p>
        </div>
        )}

        {!loading && notifications.length > 0 && (
             <Accordion type="single" collapsible className="w-full space-y-3">
                {notifications.map((n) => (
                     <AccordionItem key={n.id} value={n.id} className="bg-white border-b-0 rounded-xl shadow-sm transition-shadow hover:shadow-md">
                        <AccordionTrigger className="p-4 hover:no-underline text-left">
                           <div className="flex items-start gap-4 w-full">
                                <div className="p-2 bg-secondary rounded-full mt-1">
                                    {categoryIcons[n.category] || <Info className="h-5 w-5 text-gray-500" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-base leading-tight">{n.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5">
                                        <span>{n.category}</span>
                                        <span>&bull;</span>
                                        <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                                    </div>
                                </div>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <div className="space-y-4 pl-12 border-l-2 ml-5 border-dashed">
                                <p className="text-muted-foreground leading-relaxed">
                                    {n.summary}
                                </p>
                                {n.link && (
                                    <div>
                                        <Button asChild variant="outline" size="sm">
                                            <a href={n.link} target="_blank" rel="noopener noreferrer">
                                                View Source
                                            </a>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        )}
      </div>
    </div>
  );
}
