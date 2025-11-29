
import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "A2G Smart Notes",
  description: "AI-assisted pharmacy notes & practice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-gray-50 text-slate-900">
        <AppProviders>
            {children}
        </AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
