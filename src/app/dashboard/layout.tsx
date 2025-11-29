import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 ml-20 p-6">{children}</main>
    </div>
  );
}
