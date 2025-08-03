import Link from "next/link";
import {
  BookOpen,
  Bot,
  FileQuestion,
  LayoutDashboard,
  PlusCircle,
  Settings,
  BookText,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar className="bg-sidebar text-sidebar-foreground" collapsible="icon">
          <SidebarContent>
            <SidebarHeader className="p-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-primary-foreground group-data-[collapsible=icon]:justify-center"
              >
                <Bot className="h-8 w-8 text-sidebar-primary" />
                <span className="font-headline text-2xl font-bold group-data-[collapsible=icon]:hidden">
                  phamA2G
                </span>
              </Link>
            </SidebarHeader>
            <SidebarMenu className="flex-1 p-4">
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard"
                  tooltip="Dashboard"
                  isActive
                >
                  <LayoutDashboard />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/dashboard/notes" tooltip="My Notes">
                  <BookOpen />
                  My Notes
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/ai-note-generator"
                  tooltip="AI Note Generator"
                >
                  <Bot />
                  AI Note Generator
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/ai-quiz-generator"
                  tooltip="AI Quiz Generator"
                >
                  <FileQuestion />
                  AI Quiz Generator
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  href="/dashboard/ai-document-summarizer"
                  tooltip="AI Document Summarizer"
                >
                  <BookText />
                  AI Document Summarizer
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="#" tooltip="Settings">
                  <Settings />
                  Settings
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <Button asChild className="w-full group-data-[collapsible=icon]:w-auto">
              <Link href="/dashboard/ai-note-generator">
                <PlusCircle className="group-data-[collapsible=icon]:mr-0 mr-2" />
                <span className="group-data-[collapsible=icon]:hidden">New Note</span>
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="font-headline text-xl font-semibold">Dashboard</h1>
            </div>
            <UserNav />
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
