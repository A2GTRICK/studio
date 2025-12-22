
import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

// Helper to determine plan duration in days
function getPlanDuration(planId: string): number {
    if (planId === 'pro_monthly') return 30;
    if (planId === 'pro_quarterly') return 90;
    if (planId === 'pro_yearly') return 365;
    return 0; // Default for single purchases or unknown plans
}


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
      amount,
      contentId,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId ||
      !plan
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await adminDb.collection("payment_failures").add({
        reason: "Signature mismatch",
        userId,
        razorpay_order_id,
        attemptedAt: new Date(),
      }).catch(logError => console.error("Failed to log payment failure:", logError));
      
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 401 }
      );
    }

    await adminDb.collection("payments").add({
      userId,
      plan,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      createdAt: new Date(),
      status: "success",
      contentId: contentId || null,
    });

    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    // --- ACCESS GRANTING LOGIC ---
    if (plan.startsWith('pro_')) {
      const durationDays = getPlanDuration(plan);
      const baseDate = (userData?.premiumUntil && new Date(userData.premiumUntil) > new Date()) 
                         ? new Date(userData.premiumUntil) 
                         : new Date();
      
      baseDate.setDate(baseDate.getDate() + durationDays);

      await userRef.set(
        {
          plan: "pro",
          premiumUntil: baseDate.toISOString(),
        },
        { merge: true }
      );

    } else if (plan.startsWith("single_") && contentId) {
      const contentType = plan.split("_")[1];
      let grantField = "";
      if (contentType === "note") grantField = "grantedNoteIds";
      if (contentType === "test") grantField = "grantedTestIds";
      
      if (grantField) {
        await userRef.set(
          { [grantField]: FieldValue.arrayUnion(contentId) },
          { merge: true }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Server error during payment verification" },
      { status: 500 }
    );
  }
}
