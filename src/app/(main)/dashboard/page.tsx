
import { Suspense } from 'react';
import DashboardClient from './dashboard-client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

// A lightweight skeleton component to show while the main content is loading.
const DashboardPageSkeleton = () => (
     <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
        </div>
        <div>
           <Skeleton className="h-9 w-36" />
        </div>
      </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                 <div className="sm:col-span-2">
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
            <div className="space-y-6">
                 <Skeleton className="h-full w-full min-h-[228px]" />
            </div>
        </div>

      <div className="flex flex-col items-center justify-center text-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your smart dashboard...</p>
      </div>
    </div>
);


export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}
