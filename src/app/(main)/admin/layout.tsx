
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Users, NotebookPen, GraduationCap, Gem, Megaphone } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabChange = (value: string) => {
    router.push(`/admin/${value}`);
  };

  // Determine the active tab from the URL path
  const activeTab = pathname.split('/admin/')[1] || 'notes';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Shield className="h-8 w-8" />
            </div>
            <div>
                <CardTitle className="font-headline text-3xl">Admin Panel</CardTitle>
                <CardDescription>Manage your application's content, users, and services.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="notes">
            <NotebookPen className="mr-2 h-4 w-4" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="services">
            <GraduationCap className="mr-2 h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Gem className="mr-2 h-4 w-4" />
            Plans
          </TabsTrigger>
           <TabsTrigger value="marketing">
            <Megaphone className="mr-2 h-4 w-4" />
            Marketing
          </TabsTrigger>
        </TabsList>
        {/* The content for each tab is rendered by the page.tsx files */}
      </Tabs>

      <div>{children}</div>
    </div>
  );
}
