import { NextResponse, type NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_UID = "WXFMrKzg0eYHgFEspk8WoIIDc3j2";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idToken = body.idToken;

    if (!idToken) {
      return NextResponse.json(
        { error: "ID token is required." },
        { status: 400 }
      );
    }
    
    // Ensure admin app is initialized
    if (!adminDb) {
      return NextResponse.json({ error: "Admin SDK not initialized." }, { status: 500 });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);

    // CRITICAL: Check if the UID from the token matches the admin UID
    if (decodedToken.uid !== ADMIN_UID) {
      return NextResponse.json({ error: "Unauthorized user." }, { status: 403 });
    }

    // If authorized, create a session cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await getAuth().createSessionCookie(idToken, {
      expiresIn,
    });

    const res = NextResponse.json({ success: true });

    res.cookies.set("a2g_admin_session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });

    return res;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 401 }
    );
  }
}
