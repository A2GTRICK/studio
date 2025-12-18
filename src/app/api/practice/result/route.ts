
import { NextRequest, NextResponse } from "next/server";
import { docToPlain } from "@/lib/firestore-helpers";
import { adminDb } from "@/firebase/admin";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const resultId = url.searchParams.get("id");

    if (!resultId) {
        return NextResponse.json({ error: 'resultId is required' }, { status: 400 });
    }

    try {
        const resDoc = await adminDb.collection('results').doc(resultId).get();
        if (!resDoc.exists) return NextResponse.json(null, { status: 404 });
        return NextResponse.json(docToPlain(resDoc));
    } catch(err) {
        console.error("Failed to fetch test result:", err);
        return NextResponse.json({ error: 'Failed to fetch test result' }, { status: 500 });
    }
}
