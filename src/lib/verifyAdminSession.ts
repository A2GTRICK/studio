
// src/lib/verifyAdminSession.ts
import { type NextRequest } from "next/server";

export function isAdminAuthenticated(req: NextRequest) {
  const session = req.cookies.get("a2g_admin_session");
  if (!session || !session.value) return false;

  // In a real system you would store tokens in DB
  // For now, if cookie exists → admin
  return true;
}
