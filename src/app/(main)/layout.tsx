import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { BookOpen, BrainCircuit, GraduationCap, ShoppingCart, Gem, Bell, NotebookPen, Home, User, CheckSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <GraduationCap className="text-primary" />
            </div>
            <h1 className="text-xl font-headline font-bold text-primary">A2G Smart Notes</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Notes Library">
                <Link href="/notes">
                  <BookOpen />
                  <span>Notes Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="AI Notes Generator">
                <Link href="/ai-notes">
                  <BrainCircuit />
                  <span>AI Notes Generator</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="AI Exam Questions">
                <Link href="/exam-questions">
                  <NotebookPen />
                  <span>AI Exam Questions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="MCQ Practice">
                <Link href="/mcq-practice">
                  <CheckSquare />
                  <span>MCQ Practice</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Academic Services">
                <Link href="/services">
                  <GraduationCap />
                  <span>Academic Services</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Store">
                <Link href="/store">
                  <ShoppingCart />
                  <span>Store</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Premium Plans">
                <Link href="/premium">
                  <Gem />
                  <span>Premium Plans</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Notifications">
                <Link href="/notifications">
                  <Bell />
                  <span>Notifications</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-3 border-t">
              <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="font-semibold truncate">User Name</p>
                <p className="text-xs text-muted-foreground truncate">user@a2g.com</p>
              </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center h-16 px-4 border-b bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto flex items-center gap-4">
             <Button variant="outline" size="sm" asChild>
                <Link href="/premium">
                    <Gem className="mr-2 h-4 w-4"/>
                    Go Premium
                </Link>
            </Button>
            <Avatar className="md:hidden">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
