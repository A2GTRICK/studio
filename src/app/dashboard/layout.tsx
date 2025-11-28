// src/app/dashboard/layout.tsx
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
        <aside className="w-64 bg-white shadow-sm p-6 hidden md:block">
          <h3 className="text-lg font-bold mb-4">A2G Smart Notes</h3>
          <nav className="space-y-2 text-sm">
            <a href="/dashboard" className="block p-2 rounded hover:bg-gray-100">🏠 Dashboard</a>
            <a href="/dashboard/notes" className="block p-2 rounded hover:bg-gray-100">📚 Notes Library</a>
            <a href="/dashboard/mcq-practice" className="block p-2 rounded hover:bg-gray-100">🧪 MCQ Practice</a>
            <a href="/dashboard/services" className="block p-2 rounded hover:bg-gray-100">🎓 Academic Services</a>
            <a href="/dashboard/notifications" className="block p-2 rounded hover:bg-gray-100">🔔 Notifications</a>
            <a href="/dashboard/profile" className="block p-2 rounded hover:bg-gray-100">👤 Profile</a>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
