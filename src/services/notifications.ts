
'use server';

import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

export interface NotificationItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  link?: string;
  createdAt: string;
}

// A unified type for any kind of notification, now sourced only from Firestore
export interface UnifiedNotification {
    id: string;
    title: string;
    summary: string;
    category: "University Update" | "Exam Alert" | "Job Notification" | "Content Update" | "General" | "PCI Circular" | "Industry Hiring" | "Student Alert" | "Paramedical Job";
    date: Date;
    source?: string;
}


export async function fetchAllNotifications(): Promise<UnifiedNotification[]> {
  try {
      const notificationsRef = collection(db, "custom_notifications");
      const q = query(notificationsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          const createdAt = data.createdAt as Timestamp;
          return {
              id: doc.id,
              title: data.title,
              summary: data.summary,
              category: data.category,
              date: createdAt ? createdAt.toDate() : new Date(),
              source: data.link,
          };
      });
  } catch (error) {
      console.error("Failed to fetch custom notifications:", error);
      return []; // Return empty array on error to not break the page
  }
}
