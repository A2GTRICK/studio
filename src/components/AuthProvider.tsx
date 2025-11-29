// src/components/AuthProvider.tsx
"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { ReactNode } from "react";

export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}