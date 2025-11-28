import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "A2G Smart Notes",
  description: "AI-assisted pharmacy notes & practice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-slate-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}