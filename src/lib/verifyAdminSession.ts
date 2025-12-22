// src/lib/verifyAdminSession.ts
import { type NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "./firebaseAdmin";

const ADMIN_UID = "WXFMrKzg0eYHgFEspk8WoIIDc3j2";

export async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
  const session = req.cookies.get("a2g_admin_session")?.value;
  if (!session) return false;

  try {
    // Initialize admin app if not already done
    if (!adminDb) {
      console.error("verifyAdminSession: Firebase Admin not initialized.");
      return false;
    }
    
    const decoded = await getAuth().verifySessionCookie(session, true);
    
    // Check if the user is the designated admin
    return decoded.uid === ADMIN_UID;

  } catch (error) {
    console.warn("Admin session verification failed:", error);
    return false;
  }
}
