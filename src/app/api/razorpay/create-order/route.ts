
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { amount, plan, contentId } = body;

    if (!amount || !plan) {
      return NextResponse.json(
        { error: "Invalid request: amount and plan are required." },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const notes: { plan: string, contentId?: string } = { plan };
    if (contentId) {
        notes.contentId = contentId;
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount is in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: notes,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay order error:", error);
    return NextResponse.json(
      { error: "Unable to create order" },
      { status: 500 }
    );
  }
}
