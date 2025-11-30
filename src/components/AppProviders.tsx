
"use client";
import { ReactNode } from "react";
import { McqProvider } from "@/context/mcq-context";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
      <McqProvider>
          {children}
      </McqProvider>
  );
}
