import "./globals.css";
import AppProviders from "@/components/AppProviders";
import { Toaster } from "@/components/ui/toaster";
import { PT_Sans } from 'next/font/google';
import { cn } from "@/lib/utils";
import { Metadata } from 'next';

const fontBody = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: "pharmA2G | Smart Notes & AI Tools for Pharmacy Students",
  description: "Your smart friend for pharmacy exams (GPAT, NIPER) and studies (D.Pharm, B.Pharm). Get AI-powered notes, MCQ practice, and expert academic services.",
  openGraph: {
    title: "pharmA2G | Smart Notes & AI Tools for Pharmacy Students",
    description: "AI-powered learning platform for D.Pharm, B.Pharm, GPAT, NIPER and other pharmacy exams.",
    images: [{
      url: 'https://i.postimg.cc/k5CkkR0S/image-logo.png',
      width: 800,
      height: 600,
      alt: 'pharmA2G Logo'
    }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={cn(
        "min-h-screen font-body text-foreground bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50",
        fontBody.variable
      )}>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        />
        <AppProviders>
            {children}
        </AppProviders>
        <Toaster />
      </body>
    </html>
  );
}
