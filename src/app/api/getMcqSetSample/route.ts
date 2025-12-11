import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { getAdminDb } = await import("@/lib/firebaseAdmin");

  const adminDb = getAdminDb();
  const url = new URL(req.url);
  const setId = url.searchParams.get("setId");

  if (!setId) {
    return NextResponse.json(
      { error: "setId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const mcqRef = adminDb.collection("mcqSets").doc(setId);
    const mcqDoc = await mcqRef.get();

    if (!mcqDoc.exists) {
      return NextResponse.json(
        { error: "MCQ set not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(mcqDoc.data());
  } catch (error) {
    console.error("Error fetching MCQ set:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}