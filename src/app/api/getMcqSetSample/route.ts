
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { getAdminDb } = await import("@/lib/firebaseAdmin");
  const adminDb = getAdminDb();
  const url = new URL(req.url);
  const setId = url.searchParams.get("setId");
  if (!setId) return NextResponse.json({ error: "setId required" }, { status: 400 });
  
  try {
    const snap = await adminDb.collection("mcqSets").doc(setId).get();
    if (!snap.exists) {
        return NextResponse.json({ questions: [] });
    }
    const data = snap.data();
    // Assuming questions are stored in a 'questions' array field
    const questions = (data?.questions || []).slice(0, 2).map((q: any) => {
        const { correctAnswer, explanation, ...rest } = q;
        return rest; // Return question without the answer and explanation
    });
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching MCQ sample:", error);
    return NextResponse.json({ error: "Failed to fetch sample questions." }, { status: 500 });
  }
}
