"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  BookOpen,
  DraftingCompass,
  LayoutDashboard,
  HelpingHand,
  BarChart3,
  Settings,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FirebaseClientProvider } from "@/firebase/client-provider";

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
  
  const isMockTest = pathname.startsWith("/dashboard/mock-test");

  if (isMockTest) {
    // FULL VIEWPORT – NO SIDEBAR – NO CONSTRAINTS
    return (
      <FirebaseClientProvider>
        <div className="min-h-screen w-screen bg-slate-50">
          {children}
        </div>
      </FirebaseClientProvider>
    );
  }

  const getHeaderTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/dashboard/notes')) return 'Notes Library';
    if (pathname.startsWith('/dashboard/mcq-practice')) return 'MCQ Practice';
    if (pathname.startsWith('/dashboard/mock-test')) return 'Mock Test';
    if (pathname.startsWith('/dashboard/services')) return 'Academic Services';
    if (pathname.startsWith('/dashboard/settings')) return 'Settings';
    return 'Dashboard';
  }

  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar>
            <div className="flex h-16 items-center px-4">
              <Link
                href="/dashboard"
                className="font-bold text-lg text-primary"
              >
                pharmA2G
              </Link>
            </div>

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
                href="/dashboard/mock-test"
                icon={BarChart3}
                label="Mock Test"
              />

              <NavItem
                href="/dashboard/services"
                icon={HelpingHand}
                label="Services"
              />

              <NavItem
                href="/dashboard/settings"
                icon={Settings}
                label="Settings"
              />
            </SidebarMenu>
          </Sidebar>
          <SidebarInset>
              <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                <SidebarTrigger className="md:hidden"/>
                <h1 className="text-lg font-semibold md:text-xl">
                  {getHeaderTitle()}
                </h1>
              </header>
            <main className='flex-1 p-4 md:p-6 bg-secondary/40'>{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
