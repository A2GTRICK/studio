'use client';

import React from 'react';
import { NotesProvider } from '@/context/notes-context';
import { McqProvider } from '@/context/mcq-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <McqProvider>
      <NotesProvider>{children}</NotesProvider>
    </McqProvider>
  );
}
