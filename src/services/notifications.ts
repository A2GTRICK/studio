'use server';

import { db } from '@/firebase/config';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { fetchPharmacyNews } from '@/ai/flows/fetch-pharmacy-news';
import { type PharmacyNewsOutput as AiNotification } from "@/ai/flows/types";

// Represents a custom notification created by an admin
export interface CustomNotification {
    id: string;
    title: string;
    summary: string;
    category: AiNotification[0]['category'];
    link?: string;
    createdAt: Timestamp | Date;
}

// A unified type for any kind of notification
export interface UnifiedNotification {
    id: string;
    title: string;
    summary: string;
    category: AiNotification[0]['category'];
    date: Date;
    source?: string;
}

/**
 * Fetches all custom notifications from the 'custom_notifications' collection in Firestore.
 */
async function fetchCustomNotifications(): Promise<UnifiedNotification[]> {
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

/**
 * Fetches all notifications from both AI and Firestore sources,
 * merges them, and sorts them by date.
 */
export async function fetchAllNotifications(): Promise<UnifiedNotification[]> {
    try {
        // Fetch from both sources in parallel
        const [aiNotificationsResult, customNotifications] = await Promise.all([
            fetchPharmacyNews(),
            fetchCustomNotifications()
        ]);

        // Map AI notifications to the unified format
        const formattedAiNotifications: UnifiedNotification[] = aiNotificationsResult.map(n => ({
            ...n,
            date: new Date(n.date),
        }));

        // Combine and sort all notifications
        const allNotifications = [...formattedAiNotifications, ...customNotifications];
        allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime());

        return allNotifications;

    } catch (error) {
        console.error("Failed to fetch all notifications:", error);
        // If the AI service fails, we can still return the custom notifications
        // This makes the feature more resilient.
        return fetchCustomNotifications();
    }
}
