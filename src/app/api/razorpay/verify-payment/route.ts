import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

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
      contentId, // Capture contentId for single purchases
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
      contentId: contentId || null, // Log the contentId if it exists
    });

    const userRef = adminDb.collection("users").doc(userId);

    // ✅ Grant access based on the plan
    if (plan === "pro") {
      // Pro Plan: Update general premium status
      await userRef.set(
        {
          plan: "pro",
          premiumUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(), // Example: 1 month validity
        },
        { merge: true }
      );
    } else if (plan.startsWith("single_") && contentId) {
      // Single Purchase: Add the specific contentId to the user's grants
      const contentType = plan.split("_")[1]; // "note", "test", etc.
      let grantField = "";
      if (contentType === "note") grantField = "grantedNoteIds";
      if (contentType === "test") grantField = "grantedTestIds";
      // Add other content types as needed

      if (grantField) {
        await userRef.set(
          {
            [grantField]: FieldValue.arrayUnion(contentId),
          },
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
