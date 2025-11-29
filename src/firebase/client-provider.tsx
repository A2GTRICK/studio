"use client";

import React from "react";
import type { ReactNode } from "react";

/**
 * Minimal Firebase client provider wrapper.
 *
 * The file exists because other modules import `FirebaseClientProvider` from
 * './client-provider'. It doesn't need to re-initialize Firebase (that is done
 * in your firebaseClient). Instead it wraps children with any client-side
 * providers you need (AuthProvider, Theme, etc).
 *
 * If you have an AuthProvider in src/hooks/use-auth.tsx we wrap with that.
 * If you need additional providers, add them here.
 */

let AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

// Attempt to load your app's auth provider if available
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const mod = require("@/hooks/use-auth");
  if (mod && mod.AuthProvider) {
    // @ts-ignore
    AuthProvider = mod.AuthProvider;
  }
} catch (err) {
  // If the hook file doesn't exist yet, we silently fallback to no-op provider.
  // This keeps the module import safe during build and dev.
  // You can remove this try/catch once your AuthProvider is present.
  // console.warn("use-auth not found; using no-op AuthProvider.");
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}