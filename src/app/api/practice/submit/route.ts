
import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";


export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload || !payload.testId || !payload.answers) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, "testAttempts"), {
        testId: payload.testId,
        answers: payload.answers,
        timeTakenSeconds: payload.timeTakenSeconds,
        warnings: payload.warnings,
        submittedAt: serverTimestamp(),
    });

    return NextResponse.json(
      { message: "Submission successful", resultId: docRef.id },
      { status: 200 }
    );

  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
