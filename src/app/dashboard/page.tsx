"use client";

import Link from "next/link";
import { BookOpen, Layers, GraduationCap, Sparkles } from "lucide-react";
import clsx from "clsx";

const features = [
  {
    title: "Notes Library",
    desc: "Access organized notes from all subjects.",
    href: "/dashboard/notes",
    icon: <BookOpen size={28} />,
    accent: "from-purple-300 to-purple-100",
  },
  {
    title: "MCQ Practice",
    desc: "Practice MCQs for GPAT, NIPER & D.Pharm.",
    href: "/dashboard/mcq-practice",
    icon: <Layers size={28} />,
    accent: "from-blue-200 to-blue-50",
  },
  {
    title: "Academic Services",
    desc: "Project files, reports, dissertation help.",
    href: "/dashboard/services",
    icon: <GraduationCap size={28} />,
    accent: "from-rose-200 to-rose-50",
  },
];

function FeatureCard({ item }: { item: typeof features[number] }) {
  return (
    <Link href={item.href} className="group">
      <article
        className={clsx(
          "relative overflow-hidden rounded-2xl p-5 md:p-6 shadow-sm transition-transform transform hover:-translate-y-2 hover:shadow-xl",
          "bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40"
        )}
        aria-labelledby={`fc-${item.title}`}
      >
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              "shrink-0 p-3 rounded-xl flex items-center justify-center",
              "bg-white/75 ring-1 ring-white/40"
            )}
            style={{ boxShadow: "0 6px 18px rgba(16,24,40,0.06)" }}
          >
            <div className="text-purple-600">{item.icon}</div>
          </div>

          <div className="flex-1">
            <h3 id={`fc-${item.title}`} className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
          </div>

          <div className="flex items-center">
            <span
              className={clsx(
                "inline-block rounded-full px-3 py-1 text-sm font-medium",
                "bg-gradient-to-br text-slate-900/90"
              )}
              style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.65), rgba(255,255,255,0.35))` }}
            >
              Open
            </span>
          </div>
        </div>

        {/* Accent block (subtle) */}
        <div
          aria-hidden
          className={`absolute -right-10 -top-10 w-48 h-48 rounded-full opacity-30 blur-3xl ${item.accent}`}
          style={{ mixBlendMode: "screen" }}
        />
      </article>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-10 mb-8 bg-gradient-to-r from-indigo-50 to-sky-50 border border-white/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome to <span className="text-indigo-700">A2G Smart Notes</span> <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 text-slate-700 max-w-xl">
              Your all-in-one platform for pharmacy learning. Access curated notes, practice high-quality MCQs,
              and get academic help — all in one place.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/dashboard/notes" className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white/90 shadow-sm text-sm font-medium">
                <Sparkles size={16} /> Explore Notes
              </Link>
              <Link href="/dashboard/mcq-practice" className="inline-flex items-center gap-2 rounded-full px-4 py-2 border bg-transparent text-sm font-medium">
                Start Practice
              </Link>
            </div>
          </div>
        </div>

        {/* wave svg */}
        <svg viewBox="0 0 1440 80" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none" aria-hidden>
          <path d="M0,20 C200,80 400,0 720,20 C1040,40 1240,0 1440,30 L1440 80 L0 80 Z" fill="rgba(255,255,255,0.6)"></path>
        </svg>
      </section>

      {/* GRID */}
      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} item={f} />
          ))}
        </div>
      </section>

      {/* Floating Action Button - mobile */}
      <div className="fixed right-4 bottom-6 md:hidden">
        <Link href="/dashboard/generate" className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 text-white shadow-xl">
          Generate MCQs
        </Link>
      </div>
    </div>
  );
}
