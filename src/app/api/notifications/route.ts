
import { NextResponse } from 'next/server';
import { fetchAllNotifications } from '@/services/notifications';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notifications = await fetchAllNotifications();
    // We only need the latest 8 for the popover
    const limitedNotifications = notifications.slice(0, 8);
    return NextResponse.json({ success: true, notifications: limitedNotifications });
  } catch (err: any) {
    console.error('API /api/notifications GET error:', err.message);
    return NextResponse.json({ success: false, error: 'Failed to load notifications' }, { status: 500 });
  }
}
