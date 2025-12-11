import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { getAdminDb, getAdmin } = await import("@/lib/firebaseAdmin");

    const adminDb = getAdminDb();
    const admin = getAdmin();
    const payload = await req.json();

    if (!payload || !payload.userId || !payload.answers) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const result = {
      userId: payload.userId,
      answers: payload.answers,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminDb.collection("practiceSubmissions").add(result);

    return NextResponse.json(
      { message: "Submission successful" },
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