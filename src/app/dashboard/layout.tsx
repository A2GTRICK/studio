"use client";

import { FirebaseClientProvider } from "@/firebase/client-provider";
import { AuthSessionProvider } from "@/auth/AuthSessionProvider";

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";

import {
  BookOpen,
  DraftingCompass,
  LayoutDashboard,
  HelpingHand,
  BarChart3,
  Settings,
  Info,
  Bell,
  User,
  Archive,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserNav } from "@/components/user-nav";
import NotificationPopover from "@/components/notification-popover";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


// --------------------------------------------
// Utility: Auto-Active Menu Button
// --------------------------------------------
function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar(); 

  const active =
    (href === "/dashboard" && pathname === href) ||
    (href !== "/dashboard" && pathname.startsWith(href));


  return (
    <SidebarMenuItem>
      <Link href={href} passHref onClick={() => setOpenMobile(false)}>
        <SidebarMenuButton
          isActive={active}
          leftIcon={<Icon className="w-5 h-5" />}
        >
          {label}
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}


// --------------------------------------------
// MAIN LAYOUT
// --------------------------------------------
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const isMockTest = pathname.startsWith("/dashboard/mock-test") && !pathname.includes("vault");

  if (isMockTest) {
    // FULL VIEWPORT – NO SIDEBAR – NO CONSTRAINTS
    return (
      <FirebaseClientProvider>
        <AuthSessionProvider>
            <div className="min-h-screen w-screen bg-slate-50">
            {children}
            </div>
        </AuthSessionProvider>
      </FirebaseClientProvider>
    );
  }

  const getHeaderTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/dashboard/notes')) return 'Notes Library';
    if (pathname.startsWith('/dashboard/mcq-practice')) return 'MCQ Practice';
    if (pathname.startsWith('/dashboard/mock-test/vault')) return 'Mock Test Vault';
    if (pathname.startsWith('/dashboard/mock-test')) return 'Mock Test';
    if (pathname.startsWith('/dashboard/services')) return 'Academic Services';
    if (pathname.startsWith('/dashboard/profile')) return 'Profile';
    if (pathname.startsWith('/dashboard/billing')) return 'Billing';
    if (pathname.startsWith('/dashboard/ai-note-generator')) return 'AI Note Generator';
    if (pathname.startsWith('/dashboard/ai-quiz-generator')) return 'AI Quiz Generator';
    if (pathname.startsWith('/dashboard/ai-document-summarizer')) return 'AI Document Summarizer';
    if (pathname.startsWith('/dashboard/notifications')) return 'Notifications';
    if (pathname.startsWith('/dashboard/about')) return 'About';
    if (pathname.startsWith('/dashboard/help')) return 'Help';
    if (pathname.startsWith('/dashboard/settings')) return 'Settings';
    return 'pharmA2G';
  }

  return (
    <FirebaseClientProvider>
      <AuthSessionProvider>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar>
              <SidebarHeader>
                 <div className="flex h-16 items-center px-2">
                    <Link
                      href="/dashboard"
                      className="font-bold text-lg text-primary"
                    >
                      pharmA2G
                    </Link>
                  </div>
              </SidebarHeader>
              

              <SidebarContent>
                <SidebarMenu>
                  <NavItem
                    href="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                  />

                  <NavItem href="/dashboard/notes" icon={BookOpen} label="Notes" />

                  <NavItem
                    href="/dashboard/mcq-practice"
                    icon={DraftingCompass}
                    label="MCQ Practice"
                  />

                  <NavItem
                    href="/dashboard/mock-test/vault"
                    icon={Archive}
                    label="Mock Test Vault"
                  />
                  
                  <NavItem
                    href="/dashboard/services"
                    icon={HelpingHand}
                    label="Services"
                  />
                  <NavItem
                    href="/dashboard/notifications"
                    icon={Bell}
                    label="Notifications"
                  />
                </SidebarMenu>
              </SidebarContent>

              <SidebarFooter>
                  <SidebarMenu>
                     <NavItem
                        href="/dashboard/about"
                        icon={Info}
                        label="About"
                      />
                      <NavItem
                        href="/dashboard/help"
                        icon={HelpingHand}
                        label="Help & FAQ"
                      />
                  </SidebarMenu>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset>
                <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                  <SidebarTrigger className="md:hidden"/>
                  <h1 className="text-lg font-semibold md:text-xl">
                    {getHeaderTitle()}
                  </h1>
                  <div className="ml-auto flex items-center gap-4">
                    <NotificationPopover />
                    <UserNav />
                  </div>
                </header>
              <main className='flex-1 p-4 md:p-6 bg-secondary/40'>{children}</main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </AuthSessionProvider>
    </FirebaseClientProvider>
  );
}
