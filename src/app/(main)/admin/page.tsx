
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a redirect component.
// It will redirect any user landing on /admin to /admin/notes by default.
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/notes');
  }, [router]);

  return null; // This page doesn't render anything visible
}
