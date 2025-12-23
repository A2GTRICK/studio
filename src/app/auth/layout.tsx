"use client";

import { FirebaseClientProvider } from "@/firebase/client-provider";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </FirebaseClientProvider>
  );
}
