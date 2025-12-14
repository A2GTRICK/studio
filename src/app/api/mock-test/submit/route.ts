import { NextResponse } from "next/server";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    await addDoc(collection(db, "testAttempts"), {
      testId,
      answers,
      timeTakenSeconds,
      warnings,
      submittedAt: serverTimestamp(),
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
