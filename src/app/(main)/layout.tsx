
'use client';

import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarMenuBadge } from "@/components/ui/sidebar";
import { BookOpen, BrainCircuit, GraduationCap, ShoppingCart, Gem, Bell, NotebookPen, Home, User, CheckSquare, Shield, LogOut, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notifications } from "@/lib/notifications-data";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { User as FirebaseUser } from 'firebase/auth';
import { AiImage } from '@/components/ai-image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function NotificationPopover() {
    const recentNotifications = notifications.slice(0, 4);

    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) {
            const years = Math.floor(interval);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            const months = Math.floor(interval);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
            const days = Math.floor(interval);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 3600;
        if (interval > 1) {
            const hours = Math.floor(interval);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
        interval = seconds / 60;
        if (interval > 1) {
            const minutes = Math.floor(interval);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        }
        const roundedSeconds = Math.floor(seconds);
        return `${roundedSeconds} second${roundedSeconds !== 1 ? 's' : ''} ago`;
    };


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5"/>
                    <span className="absolute -top-0 -right-0 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="p-4">
                  <h4 className="font-medium text-lg font-headline">Notifications</h4>
                </div>
                <Separator />
                <div className="p-2">
                    {recentNotifications.map(notification => (
                        <Link href={notification.link || '/notifications'} key={notification.id} className="block">
                            <div className="p-2 rounded-lg hover:bg-muted">
                                <p className="text-sm font-semibold">{notification.title}</p>
                                <p className="text-xs text-muted-foreground">{timeAgo(notification.date)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                <Separator />
                 <div className="p-2">
                    <Button variant="ghost" className="w-full" asChild>
                        <Link href="/notifications">View all notifications</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

function UserProfile({ user, logout }: { user: FirebaseUser, logout: () => Promise<void> }) {
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };
    
    const getInitials = (email: string | null) => {
        if (!email) return 'U';
        const name = user.displayName;
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return email.charAt(0).toUpperCase();
    }
    
    return (
        <AlertDialog>
            <div className="flex items-center justify-between gap-3 p-3 border-t">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar>
                        <AvatarImage src={user.photoURL || undefined} alt="User avatar" />
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="font-semibold truncate text-sm">{user.displayName || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Logout">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
            </div>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will be returned to the login page. Any unsaved progress may be lost.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

function UserProfileSkeleton() {
     return (
        <div className="flex items-center gap-3 p-3 border-t">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    )
}


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin, logout } = useAuth();
  const unreadNotificationCount = notifications.length;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center">
              <AiImage
                data-ai-id="sidebar-logo"
                data-ai-hint="modern logo pharmacy"
                alt="A2G Smart Notes Logo"
                width={28}
                height={28}
                className="rounded-md"
              />
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
              <SidebarMenuButton asChild tooltip="My Progress">
                <Link href="/my-progress">
                  <BarChart3 />
                  <span>My Progress</span>
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
                   {unreadNotificationCount > 0 && (
                      <SidebarMenuBadge>{unreadNotificationCount}</SidebarMenuBadge>
                   )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isAdmin && (
              <>
                <Separator className="my-2" />
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Admin Panel">
                    <Link href="/admin/notes">
                      <Shield />
                      <span>Admin Panel</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            {loading ? <UserProfileSkeleton /> : user ? <UserProfile user={user} logout={logout} /> : null}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex items-center h-16 px-4 border-b bg-background/80 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto flex items-center gap-2">
             <Button variant="outline" size="sm" asChild>
                <Link href="/premium">
                    <Gem className="mr-2 h-4 w-4"/>
                    Go Premium
                </Link>
            </Button>
            <NotificationPopover />
             <div className="md:hidden">
                {loading ? <Skeleton className="h-8 w-8 rounded-full" /> : user ? <UserProfile user={user} logout={logout} /> : null}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
