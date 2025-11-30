
'use server';

import { adminDb } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export interface NotificationItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  link?: string;
  createdAt: string;
}

export async function fetchAllNotifications(): Promise<NotificationItem[]> {
  const snapshot = await adminDb
    .collection("custom_notifications")
    .orderBy("createdAt", "desc")
    .get();

  const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      const time = data.createdAt as Timestamp;
      return {
        id: doc.id,
        title: data.title,
        summary: data.summary,
        category: data.category,
        link: data.link,
        createdAt: time ? time.toDate().toISOString() : new Date().toISOString(),
      } as NotificationItem;
  });

  return notifications;
}
