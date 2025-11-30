
import { FirebaseClientProvider } from "@/firebase/client-provider";
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
import { NotificationPopover } from "@/components/notification-popover";

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
    <FirebaseClientProvider>
      <SidebarProvider>
        <Sidebar variant="floating" collapsible="icon" side="left">
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
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center justify-between border-b px-4">
             <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <Link
                  href="/dashboard"
                  className="text-lg font-bold text-primary lg:hidden"
                >
                  phamA2G
                </Link>
            </div>
            <div className="flex items-center gap-2 ml-auto">
                <NotificationPopover />
                {/* Placeholder for future user nav */}
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
