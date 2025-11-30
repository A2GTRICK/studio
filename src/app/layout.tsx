import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google';
import { cn } from "@/lib/utils";
import Header from "@/components/Header";

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata = {
  title: "A2G Smart Notes",
  description: "AI-assisted pharmacy notes & practice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(
        "min-h-screen bg-background font-body text-foreground",
        fontBody.variable
      )}>
        <AppProviders>
            <Header />
            {children}
        </AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
