// src/app/dashboard/notes/page.tsx (Server Component)

import React, { Suspense } from 'react';
import { fetchAllNotes, type Note } from '@/services/notes';
import NotesPageClient from './notes-page-client';
import { Loader2 } from 'lucide-react';

/**
 * Server component to pre-fetch data and pass it to the client.
 * This pattern is optimal for performance and SEO.
 */
async function NotesData() {
  const notes: Note[] = await fetchAllNotes();
  return <NotesPageClient initialNotes={notes} />;
}

export default function NotesLibraryPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <NotesData />
    </Suspense>
  );
}
