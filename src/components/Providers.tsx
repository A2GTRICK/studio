
'use client';

import React from 'react';
import { McqProvider } from '@/context/mcq-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <McqProvider>
      {children}
    </McqProvider>
  );
}
