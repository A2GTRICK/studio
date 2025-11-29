"use client";

import { BookOpen, Layers, GraduationCap, Megaphone } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const features = [
    {
      title: "Notes Library",
      icon: <BookOpen size={32} className="text-purple-600" />,
      desc: "Access organized notes from all subjects.",
      href: "/dashboard/notes",
      color: "from-purple-50 to-purple-100",
    },
    {
      title: "MCQ Practice",
      icon: <Layers size={32} className="text-blue-600" />,
      desc: "Practice MCQs for GPAT, NIPER & D.Pharm.",
      href: "/dashboard/mcq-practice",
      color: "from-blue-50 to-blue-100",
    },
    {
      title: "Academic Services",
      icon: <GraduationCap size={32} className="text-rose-600" />,
      desc: "Project files, reports, dissertation help.",
      href: "/dashboard/services",
      color: "from-rose-50 to-rose-100",
    },
    {
      title: "Latest Update",
      icon: <Megaphone size={32} className="text-green-600" />,
      desc: "New Pharmacognosy Unit 2 diagrams added.",
      href: "/dashboard/updates",
      color: "from-green-50 to-green-100",
    },
  ];

  return (
    <div className="p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome to A2G Smart Notes 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Your all-in-one platform for pharmacy learning.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <Link key={i} href={f.href}>
            <div
              className={`
                group cursor-pointer p-6 rounded-2xl border shadow-sm 
                bg-gradient-to-br ${f.color}
                transition-all duration-300 hover:shadow-xl
                hover:-translate-y-1
              `}
            >
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  {f.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-purple-700">
                    {f.title}
                  </h2>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}