
import { NextResponse } from 'next/server';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notificationsRef = collection(db, 'custom_notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), );
    const querySnapshot = await getDocs(q);
    
    const notifications = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            summary: data.summary,
            category: data.category,
            link: data.link || null,
            createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        };
    });

    const limitedNotifications = notifications.slice(0, 8);

    return NextResponse.json({ success: true, notifications: limitedNotifications });
  } catch (err: any) {
    console.error('API /api/notifications GET error:', err.message);
    return NextResponse.json({ success: false, error: 'Failed to load notifications. Check server logs.' }, { status: 500 });
  }
}
