import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/firebase/admin"; 
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { testId } = await req.json();

    if (!testId) {
      return NextResponse.json(
        { error: "Missing testId" },
        { status: 400 }
      );
    }

    // 1️⃣ Verify user's Firebase session from the cookie
    // Note: The user's browser must send the __session cookie.
    // This requires the client to be authenticated via Firebase Client SDK first.
    const sessionCookie = cookies().get("__session")?.value;
    if (!sessionCookie) {
      // Fallback or attempt to use Authorization header if client sends ID token
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
         return NextResponse.json(
          { error: "Unauthorized: No session cookie or token." },
          { status: 401 }
        );
      }
      
      const idToken = authHeader.split('Bearer ')[1];
       try {
        await getAuth().verifyIdToken(idToken);
      } catch (e) {
         return NextResponse.json(
          { error: "Unauthorized: Invalid token." },
          { status: 401 }
        );
      }

    } else {
       try {
         await getAuth().verifySessionCookie(sessionCookie, true);
       } catch(e) {
          return NextResponse.json(
            { error: "Unauthorized: Invalid session." },
            { status: 401 }
          );
       }
    }
    
    // For simplicity in this example, we'll assume the user is authenticated if they get past the initial checks.
    // In a real app, you'd extract the UID from the decoded token.
    // const decoded = await getAuth().verifyIdToken(token);
    // const uid = decoded.uid;
    const uid = "some-mock-user-id-for-now"; // Replace with real UID extraction

    // 2️⃣ Load test
    const testSnap = await adminDb
      .collection("test_series")
      .doc(testId)
      .get();

    if (!testSnap.exists) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    const test = testSnap.data();
    const isPaidTest =
      test?.isPremium === true && (test?.price ?? 0) > 0;

    // 3️⃣ If paid → verify purchase (example logic)
    if (isPaidTest) {
      // This is example logic. You'd check against your 'users' collection or a dedicated 'purchases' subcollection.
      const userSnap = await adminDb.collection("users").doc(uid).get();
      const userData = userSnap.data();

      const hasActiveSubscription = userData?.plan === 'pro' && new Date(userData.premiumUntil) > new Date();
      const hasSpecificGrant = userData?.grantedTestIds?.includes(testId);
      
      if (!hasActiveSubscription && !hasSpecificGrant) {
        return NextResponse.json(
          { error: "Payment required" },
          { status: 403 }
        );
      }
    }

    // 4️⃣ Allow test start
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API /api/mock-test/start error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
