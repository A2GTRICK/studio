
"use client";

import React from "react";
import type { ReactNode } from "react";

/**
 * Minimal client provider wrapper.
 * It doesn't need to re-initialize Firebase. Instead it wraps children with any client-side
 * providers you need (Theme, etc).
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
