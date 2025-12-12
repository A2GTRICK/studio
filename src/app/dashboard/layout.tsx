
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { BookOpen, DraftingCompass, LayoutDashboard, HelpingHand, BarChart3, Settings, UserCircle } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/notes', label: 'Notes', icon: BookOpen },
        { href: '/dashboard/mcq-practice', label: 'MCQ Practice', icon: DraftingCompass },
        { href: '/dashboard/mock-test', label: 'Mock Test', icon: BarChart3 },
        { href: '/dashboard/services', label: 'Services', icon: HelpingHand },
        { href: '/dashboard/settings', label: 'Settings', icon: Settings },
    ];

  return (
    <FirebaseClientProvider>
        <div className="flex min-h-screen w-full">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <span className="text-xl font-bold text-primary">pharmA2G</span>
                    </Link>
                </div>
                <nav className="flex-1 overflow-auto py-4">
                    <div className="grid items-start px-4 text-sm font-medium">
                        {navItems.map(({ href, label, icon: Icon }) => (
                            <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        ))}
                    </div>
                </nav>
            </aside>
            
            {/* Main Content */}
            <div className="flex flex-col flex-1">
                <Header />
                <main className="flex-1 p-6 bg-secondary/30">{children}</main>
            </div>
        </div>
    </FirebaseClientProvider>
  );
}
