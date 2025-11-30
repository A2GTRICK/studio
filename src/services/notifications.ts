
'use server';

import { db } from '@/firebase/config';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

// This is the category type from the AI flow, kept for compatibility with the frontend
// but the AI flow itself is no longer used.
const validCategories = [
    "University Update", 
    "Exam Alert", 
    "Job Notification", 
    "Content Update", 
    "General", 
    "PCI Circular", 
    "Industry Hiring", 
    "Student Alert", 
    "Paramedical Job"
] as const;

type NotificationCategory = typeof validCategories[number];


// Represents a custom notification created by an admin
export interface CustomNotification {
    id: string;
    title: string;
    summary: string;
    category: NotificationCategory;
    link?: string;
    createdAt: Timestamp | Date;
}

// A unified type for any kind of notification, now sourced only from Firestore
export interface UnifiedNotification {
    id: string;
    title: string;
    summary: string;
    category: NotificationCategory;
    date: Date;
    source?: string;
}

/**
 * Fetches all custom notifications from the 'custom_notifications' collection in Firestore.
 * This is now the single source of truth for all notifications.
 */
export async function fetchAllNotifications(): Promise<UnifiedNotification[]> {
    try {
        const notificationsRef = collection(db, "custom_notifications");
        const q = query(notificationsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map((doc) => {
            const data = doc.data() as CustomNotification;
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
