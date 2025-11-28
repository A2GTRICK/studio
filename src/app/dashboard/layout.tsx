export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
        
        <h2 className="text-2xl font-bold mb-6">A2G Smart Notes</h2>

        <nav className="space-y-3 text-gray-700">

          <a href="/dashboard" className="block p-2 rounded hover:bg-gray-200">🏠 Dashboard</a>

          <a href="/dashboard/notes" className="block p-2 rounded hover:bg-gray-200">📚 Notes Library</a>

          <a href="/dashboard/mcq-practice" className="block p-2 rounded hover:bg-gray-200">🧪 MCQ Practice</a>

          <a href="/dashboard/services" className="block p-2 rounded hover:bg-gray-200">🎓 Academic Services</a>

          <a href="/dashboard/notifications" className="block p-2 rounded hover:bg-gray-200">🔔 Notifications</a>

          <a href="/dashboard/profile" className="block p-2 rounded hover:bg-gray-200">👤 Profile</a>

        </nav>

        <div className="mt-auto pt-6">
          <p className="text-xs text-gray-400">A2G Smart Notes © 2025</p>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
