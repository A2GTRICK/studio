
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      testId,
      answers,
      timeTakenSeconds,
      warnings,
    } = body;

    if (!testId || !answers) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    await adminDb.collection("testAttempts").add({
      testId,
      answers,
      timeTakenSeconds,
      warnings,
      submittedAt: new Date(),
      source: "mock-test",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Mock test submit failed:", err);
    return NextResponse.json(
      { error: "Submit failed" },
      { status: 500 }
    );
  }
}
