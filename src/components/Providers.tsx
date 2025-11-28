"use client";

import React from "react";
import { NotesProvider } from "@/context/notes-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NotesProvider>
      {children}
    </NotesProvider>
  );
}