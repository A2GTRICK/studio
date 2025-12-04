
"use client";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Users",
      value: "12,540",
    },
    {
      label: "Total Notes",
      value: "346",
    },
    {
      label: "MCQ Sets",
      value: "58",
    },
    {
      label: "Blog Posts",
      value: "42",
    },
  ];

  const quickActions = [
    { label: "Add New Note", href: "/a2gadmin/notes/create" },
    { label: "Create MCQ Set", href: "/a2gadmin/mcq/create" },
    { label: "Write Blog Post", href: "/a2gadmin/blog/create" },
    { label: "Add Job Update", href: "/a2gadmin/jobs/create" },
  ];

  return (
    <div className="text-white">

      {/* Analytics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-white/20 transition-all"
          >
            <div className="text-3xl font-bold mb-2">{item.value}</div>
            <div className="text-sm opacity-80 tracking-wide">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-3 tracking-wide">Quick Actions</h2>

      <div className="grid md:grid-cols-4 gap-6">
        {quickActions.map((action, idx) => (
          <a
            key={idx}
            href={action.href}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-xl hover:bg-white/20 transition-all block text-center"
          >
            <span className="text-md font-medium tracking-wide">{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
