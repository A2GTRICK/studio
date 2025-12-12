
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
                    <SidebarMenuButton href="/dashboard" left={<LayoutDashboard />}>Dashboard</SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/notes" left={<BookOpen />}>Notes</SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/mcq-practice" left={<DraftingCompass />}>MCQ Practice</SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/mock-test" left={<BarChart3 />}>Mock Test</SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/services" left={<HelpingHand />}>Services</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton href="/dashboard/settings" left={<Settings />}>Settings</SidebarMenuButton>
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
