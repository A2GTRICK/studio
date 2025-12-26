
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

    // 1. Get the ID token from the Authorization header.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: No token provided." },
        { status: 401 }
      );
    }
    const idToken = authHeader.split("Bearer ")[1];

    // 2. Verify the ID token using the Firebase Admin SDK.
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 3. Load the test details.
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

    // 4. If it's a paid test, verify the user's purchase or subscription.
    if (isPaidTest) {
      const userSnap = await adminDb.collection("users").doc(uid).get();
      const userData = userSnap.data();

      const hasActiveSubscription =
        userData?.plan === "pro" &&
        new Date(userData.premiumUntil) > new Date();
      const hasSpecificGrant = userData?.grantedTestIds?.includes(testId);

      if (!hasActiveSubscription && !hasSpecificGrant) {
        return NextResponse.json(
          { error: "Payment required" },
          { status: 403 } // 403 Forbidden is more appropriate here
        );
      }
    }

    // 5. If all checks pass, allow the test to start.
    return NextResponse.json({ ok: true });
    
  } catch (err: any) {
    // This will catch invalid tokens, expired tokens, etc.
    console.error("API /api/mock-test/start error:", err);
    
    if (err.code === 'auth/id-token-expired') {
        return NextResponse.json(
          { error: "Unauthorized: Session has expired. Please log in again." },
          { status: 401 }
        );
    }
    
    return NextResponse.json(
      { error: "Unauthorized: Invalid token." },
      { status: 401 }
    );
  }
}
