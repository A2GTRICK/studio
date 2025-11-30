import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ success: false, error: 'A valid email is required.' }, { status: 400 });
    }

    const subscribersRef = collection(db, 'subscribers');
    
    // Check if the email already exists
    const q = query(subscribersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json({ success: false, error: 'This email is already subscribed.' }, { status: 409 });
    }

    // Add the new subscriber
    await addDoc(subscribersRef, {
      email: email.toLowerCase(),
      subscribedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Successfully subscribed!' });

  } catch (error) {
    console.error('Subscription API Error:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred.' }, { status: 500 });
  }
}
