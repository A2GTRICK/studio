
"use client";
import { ReactNode } from "react";

// This component is now a wrapper for CLIENT-SIDE providers.
// The MCQ Provider, which fetches data on the client, belongs here.
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
      <>
          {children}
      </>
  );
}
