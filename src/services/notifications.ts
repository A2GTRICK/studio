// src/services/notifications.ts
'use server';

import { adminDb } from '@/firebase/admin';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export type NotificationRecord = {
  id: string;
  title: string;
  summary: string;
  category: string;
  link?: string;
  course?: string;
  year?: string;
  createdAt?: string; // ISO
};

export async function fetchAllNotifications(): Promise<NotificationRecord[]> {
  const q = adminDb.collection('custom_notifications').orderBy('createdAt', 'desc').limit(50);
  const snap = await q.get();
  const items: NotificationRecord[] = snap.docs.map((doc: QueryDocumentSnapshot) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      title: data.title,
      summary: data.summary,
      category: data.category,
      link: data.link || null,
      course: data.course || null,
      year: data.year || null,
      createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
    };
  });
  return items;
}
