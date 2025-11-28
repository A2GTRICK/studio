"use client";

import { useUserProfile } from "@/lib/auth";

export function useAuth() {
  const { user, role } = useUserProfile();
  return {
    user,
    role,
    isAdmin: role === "admin",
  };
}