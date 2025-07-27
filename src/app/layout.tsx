
import type { Metadata } from 'next';
import './globals.css';
import './print.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { PT_Sans } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-playfair-display',
  display: 'swap',
});


export const metadata: Metadata = {
  title: 'A2G Smart Notes | Your Pharmacy Learning Partner',
  description: 'The most trusted digital platform for pharmacy students. Access high-quality notes, AI-powered study tools, exam predictors, and expert academic services.',
  icons: {
    icon: '/assets/a2g-logo.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ptSans.variable} ${playfairDisplay.variable}`}>
      <head>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

    