import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/firebase/admin";

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
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId
    ) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Create expected signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // Create a record of the failed attempt for security auditing
      try {
        await adminDb.collection("payment_failures").add({
          reason: "Signature mismatch",
          userId,
          razorpay_order_id,
          attemptedAt: new Date(),
        });
      } catch (logError) {
        console.error("Failed to log payment failure:", logError);
      }
      
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 401 }
      );
    }

    // ✅ Save payment record
    await adminDb.collection("payments").add({
      userId,
      plan,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      createdAt: new Date(),
      status: "success",
    });

    // ✅ Upgrade user plan
    await adminDb.collection("user_profiles").doc(userId).set(
      {
        plan: "pro",
        planActivatedAt: new Date(),
        planExpiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Example: 1 month validity
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Server error during payment verification" },
      { status: 500 }
    );
  }
}
