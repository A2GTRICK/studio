import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans, Playfair_Display } from 'next/font/google';
import { cn } from "@/lib/utils";

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const fontHeadline = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-playfair-display',
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
        fontBody.variable,
        fontHeadline.variable
      )}>
        <AppProviders>
            {children}
        </AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
