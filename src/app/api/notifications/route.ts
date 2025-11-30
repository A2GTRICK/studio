// src/app/api/notifications/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const q = adminDb.collection('custom_notifications').orderBy('createdAt', 'desc').limit(8);
    const snap = await q.get();
    const data = snap.docs.map(d => {
      const doc = d.data() as any;
      return {
        id: d.id,
        title: doc.title,
        summary: doc.summary,
        category: doc.category,
        link: doc.link || null,
        createdAt: doc.createdAt ? doc.createdAt.toDate().toISOString() : null,
      };
    });
    return NextResponse.json({ success: true, notifications: data });
  } catch (err) {
    console.error('API /api/notifications GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to load notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminCode, title, summary, category, link, course, year } = body;
    if (!adminCode || !title || !summary || !category) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    // verify adminCode from adminConfig/main
    const adminDoc = await adminDb.collection('adminConfig').doc('main').get();
    const adminData = adminDoc.exists ? adminDoc.data() : null;
    if (!adminData || adminData.adminCode !== adminCode) {
      return NextResponse.json({ success: false, error: 'Admin verification failed' }, { status: 403 });
    }

    await adminDb.collection('custom_notifications').add({
      title,
      summary,
      category,
      link: link || null,
      course: course || null,
      year: year || null,
      createdAt: Timestamp.now()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API /api/notifications POST error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}
