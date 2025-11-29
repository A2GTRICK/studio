
import AuthProviderWrapper from "@/components/AuthProvider";
import { UserNav } from "@/components/user-nav";
import Providers from "@/components/Providers";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
} from "@/components/ui/sidebar";
import {
  Bell,
  BookOpen,
  FileText,
  Home,
  Layers,
  Settings,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const menuItems = [
  {
    name: "Dashboard",
    icon: <Home />,
    href: "/dashboard",
  },
  {
    name: "Notes Library",
    icon: <BookOpen />,
    href: "/dashboard/notes",
  },
  {
    name: "MCQ Practice",
    icon: <Layers />,
    href: "/dashboard/mcq-practice",
  },
  {
    name: "Academic Services",
    icon: <FileText />,
    href: "/dashboard/services",
  },
  {
    name: "Notifications",
    icon: <Bell />,
    href: "/dashboard/notifications",
  },
  {
    name: "Settings",
    icon: <Settings />,
    href: "/dashboard/settings",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <AuthProviderWrapper>
        <SidebarProvider>
          <Sidebar variant="floating" collapsible="icon">
            <SidebarContent>
              <SidebarHeader>
                <h1 className="font-headline text-2xl font-bold text-primary">
                  phamA2G
                </h1>
              </SidebarHeader>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <Link href={item.href}>
                      <SidebarMenuButton
                        tooltip={item.name}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
              <UserNav />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-12 items-center justify-between border-b px-4 lg:hidden">
              <Link
                href="/dashboard"
                className="text-lg font-bold text-primary"
              >
                phamA2G
              </Link>
              <SidebarTrigger />
            </header>
            <main className="flex-1 p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </AuthProviderWrapper>
    </Providers>
  );
}
