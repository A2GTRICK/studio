
"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { McqProvider } from "@/context/mcq-context";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
      <AuthProvider>
        <McqProvider>
            {children}
        </McqProvider>
      </AuthProvider>
  );
}
