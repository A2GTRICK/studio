// src/lib/verifyAdminSession.ts
import { cookies } from "next/headers";

export function isAdminAuthenticated() {
  const session = cookies().get("a2g_admin_session");
  if (!session || !session.value) return false;

  // In a real system you would store tokens in DB
  // For now, if cookie exists → admin
  return true;
}
