import Header from "@/components/Header";
import SidebarClient from "@/components/SidebarClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <SidebarClient />

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
