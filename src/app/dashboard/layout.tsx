
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { BookOpen, DraftingCompass, LayoutDashboard, HelpingHand, BarChart3, Settings } from "lucide-react";
import Link from 'next/link';

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar>
            <div className="flex h-16 items-center px-4">
               <Link href="/dashboard" className="font-bold text-lg text-primary">pharmA2G</Link>
            </div>
             <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/dashboard" passHref>
                      <SidebarMenuButton asChild left={<LayoutDashboard />}>Dashboard</SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/notes" passHref>
                      <SidebarMenuButton asChild left={<BookOpen />}>Notes</SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/mcq-practice" passHref>
                      <SidebarMenuButton asChild left={<DraftingCompass />}>MCQ Practice</SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/mock-test" passHref>
                      <SidebarMenuButton asChild left={<BarChart3 />}>Mock Test</SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/dashboard/services" passHref>
                      <SidebarMenuButton asChild left={<HelpingHand />}>Services</SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/dashboard/settings" passHref>
                      <SidebarMenuButton asChild left={<Settings />}>Settings</SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
            </header>
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
