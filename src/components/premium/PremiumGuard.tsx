
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';

interface PremiumGuardProps {
  isPremium: boolean;
  canAccess: boolean;
  contentType: 'note' | 'test' | 'mcq';
  children: React.ReactNode;
}

export default function PremiumGuard({ isPremium, canAccess, contentType, children }: PremiumGuardProps) {
  const router = useRouter();

  if (!isPremium || canAccess) {
    return <>{children}</>;
  }

  // If content is premium but user cannot access it, show the lock screen.
  return (
    <div className="relative border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] bg-white shadow-inner overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
        <div className="relative z-10">
            <div className="mx-auto bg-amber-100 p-4 rounded-full w-fit">
                <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
                This is a Premium {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </h2>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
                Upgrade your account to unlock this content and get access to all exclusive study materials and features.
            </p>
            <Button 
                onClick={() => router.push('/dashboard/billing')} 
                className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-shadow"
            >
                <Sparkles className="mr-2 h-5 w-5" />
                Upgrade to Pro
            </Button>
        </div>
    </div>
  );
}
