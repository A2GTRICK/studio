
'use client';

import Link from 'next/link';
import { BookOpen, Layers, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

const dashboardFeatures = [
  {
    title: 'Notes Library',
    desc: 'Access organized notes from all subjects.',
    href: '/dashboard/notes',
    icon: <BookOpen size={28} />,
  },
  {
    title: 'MCQ Practice',
    desc: 'Practice MCQs for GPAT, NIPER & D.Pharm.',
    href: '/dashboard/mcq-practice',
    icon: <Layers size={28} />,
  },
  {
    title: 'Academic Services',
    desc: 'Project files, reports, dissertation help.',
    href: '/dashboard/services',
    icon: <GraduationCap size={28} />,
  },
];

function FeatureCard({ item }: { item: (typeof dashboardFeatures)[number] }) {
  return (
    <Link href={item.href} className="group">
      <article
        className={clsx(
          'relative overflow-hidden rounded-2xl p-6 shadow-lg transition-transform transform hover:-translate-y-1 hover:shadow-xl',
          'bg-white backdrop-blur-sm border border-slate-100'
        )}
        aria-labelledby={`fc-${item.title}`}
      >
        <div className="flex items-start gap-5">
          <div
            className={clsx(
              'shrink-0 p-3 rounded-lg flex items-center justify-center',
              'bg-primary/10'
            )}
          >
            <div className="text-primary">{item.icon}</div>
          </div>

          <div className="flex-1">
            <h3
              id={`fc-${item.title}`}
              className="text-lg md:text-xl font-bold text-slate-900"
            >
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {item.desc}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-10 mb-8 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-blue-50 border border-white/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Welcome to{' '}
              <span className="text-purple-700">phamA2G</span>{' '}
              <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 text-slate-700 max-w-xl">
              You're all set. Explore the library, practice for your exams, or get academic help using the navigation on the left.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-white/80 text-slate-800 shadow-sm hover:bg-white"
              >
                <Link
                  href="/dashboard/notes"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium"
                >
                  <Sparkles size={16} /> Explore Notes
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent">
                <Link
                  href="/dashboard/mcq-practice"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium"
                >
                  Start Practice
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* wave svg */}
        <svg
          viewBox="0 0 1440 80"
          className="absolute bottom-0 left-0 w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,20 C200,80 400,0 720,20 C1040,40 1240,0 1440,30 L1440 80 L0 80 Z"
            fill="rgba(255,255,255,0.6)"
          ></path>
        </svg>
      </section>

      {/* Features Section */}
      <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardFeatures.map(f => (
                <FeatureCard key={f.title} item={f} />
            ))}
        </div>
      </section>
    </div>
  );
}
