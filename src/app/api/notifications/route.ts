
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function GET() {
  try {
    const notificationsRef = collection(db, 'custom_notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(8));
    const snapshot = await getDocs(q);
    
    const data = snapshot.docs.map(d => {
      const doc = d.data();
      const createdAt = doc.createdAt?.toDate ? doc.createdAt.toDate().toISOString() : new Date().toISOString();
      return {
        id: d.id,
        title: doc.title,
        summary: doc.summary,
        category: doc.category,
        link: doc.link || null,
        createdAt: createdAt,
      };
    });

    return NextResponse.json({ success: true, notifications: data });
  } catch (err: any) {
    console.error('API /api/notifications GET error:', err.message);
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
  } catch (err: any) {
    console.error('API /api/notifications POST error:', err.message);
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 });
  }
}
