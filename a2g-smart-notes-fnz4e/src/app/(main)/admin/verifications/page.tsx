
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';


// This page is no longer needed as verification is now handled via email.
// It will redirect any user landing on /admin/verifications to /admin/users.
export default function AdminVerificationsPageRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/users');
    }, [router]);

    return (
         <div className="flex flex-col items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirecting to User Management...</p>
        </div>
    );
}
