import Header from "@/components/Header";
import SidebarClient from "@/components/SidebarClient";
import { McqProvider } from "@/context/mcq-context";
import { AuthProvider } from "@/hooks/use-auth"; // Import AuthProvider
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider> {/* Wrap with AuthProvider */}
      <McqProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />

          <div className="flex">
            <SidebarClient />

            <main className="flex-1 p-6">
              {children}
            </main>
          </div>
        </div>
        <FirebaseErrorListener />
      </McqProvider>
    </AuthProvider>
  );
}
