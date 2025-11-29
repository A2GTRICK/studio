
"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { UserNav } from "@/components/user-nav";
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
import { useEffect, useState } from "react";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { redirect } from "next/navigation";
import Providers from "@/components/Providers";

export const dynamic = "force-dynamic";

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


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const token = await user.getIdTokenResult();
      setIsAdmin(Boolean(token.claims?.admin));
    });
    return () => unsubscribe();
  }, []);

  if (isAdmin === null) {
    return <div className="flex h-screen w-full items-center justify-center">Checking admin access...</div>;
  }

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <Providers>
      <AuthProvider>
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
            <main className="flex-1 p-6">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Admin Panel</p>
                    <p>You are currently in the admin area. Changes here can affect the entire application.</p>
                </div>
                {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </Providers>
  );
}
