
"use client";

import Link from "next/link";
import {
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  BarChart3,
  History,
  Loader2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { useEffect, useState } from "react";
import { getRecentlyViewedNotes } from "@/services/getRecentlyViewedNotes";
import { getUserLearningStats } from "@/services/getUserLearningStats";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/* =========================
   DASHBOARD FEATURES
========================= */

const dashboardFeatures = [
  {
    title: "Notes Library",
    desc: "Access organized notes from all subjects.",
    href: "/dashboard/notes",
    icon: <BookOpen size={28} />,
  },
  {
    title: "MCQ Practice",
    desc: "Practice MCQs for GPAT, NIPER & D.Pharm.",
    href: "/dashboard/mcq-practice",
    icon: <Layers size={28} />,
  },
  {
    title: "Mock Test",
    desc: "Premium exam-style practice tests.",
    href: "/dashboard/mock-test",
    icon: <BarChart3 size={28} />,
  },
  {
    title: "Academic Services",
    desc: "Project files, reports, dissertation help.",
    href: "/dashboard/services",
    icon: <GraduationCap size={28} />,
  },
];

/* =========================
   TYPES
========================= */

interface RecentlyViewedNote {
  id: string;
  title: string;
  course?: string;
  subject?: string;
  year?: string;
}

/* =========================
   FEATURE CARD
========================= */

function FeatureCard({ item }: { item: (typeof dashboardFeatures)[number] }) {
  return (
    <Link href={item.href} className="group">
      <article
        className={clsx(
          "relative overflow-hidden rounded-2xl p-6 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl h-full",
          "bg-white border border-slate-100"
        )}
      >
        <div className="flex items-start gap-5">
          <div className="shrink-0 p-3 rounded-lg bg-primary/10 text-primary">
            {item.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* =========================
   LOGIN TO PERSONALIZE CARD
========================= */
function LoginToPersonalizeCard() {
  const authSession = useAuthSession();

  // Wait until auth is resolved
  if (!authSession || authSession.loading) {
    return null;
  }

  const user = authSession.user;

  // Hide if logged in
  if (user) return null;

  return (
    <div className="mt-10">
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-purple-900">
            Personalize your learning 🚀
          </h2>

          <p className="mt-2 text-gray-700">
            Login to track your progress, continue where you left off, and
            unlock premium features when you’re ready.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/auth/login?redirect=/dashboard">
                Login
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/auth/signup?redirect=/dashboard">
                Create Free Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


/* =========================
   RECENTLY VIEWED SECTION
========================= */

function RecentlyViewedSection() {
  const authSession = useAuthSession();
  const user = authSession?.user ?? null;

  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getRecentlyViewedNotes(user.uid, 5)
      .then(setRecentlyViewed)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  if (!user || (!loading && recentlyViewed.length === 0)) {
    return null;
  }

  const continueNote = recentlyViewed[0];
  const remainingNotes = recentlyViewed.slice(1);

  return (
    <Card className="mt-10 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <History className="w-6 h-6" />
          Recently Viewed Notes
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading your recent notes...
          </div>
        ) : (
          <>
            {/* CONTINUE READING CTA */}
            {continueNote && (
              <div className="p-5 rounded-xl border bg-purple-50">
                <p className="text-sm text-purple-700 font-semibold">
                  Continue where you left off
                </p>
                <h3 className="text-lg font-bold mt-1">
                  {continueNote.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {[continueNote.course, continueNote.subject]
                    .filter(Boolean)
                    .join(" • ")}
                </p>

                <Button asChild className="mt-4">
                  <Link
                    href={`/dashboard/notes/view/${continueNote.id}`}
                    className="inline-flex items-center gap-2"
                  >
                    Continue Reading <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            )}

            {/* REMAINING NOTES */}
            {remainingNotes.length > 0 && (
              <div className="space-y-3">
                {remainingNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/dashboard/notes/view/${note.id}`}
                    className="block p-4 border rounded-lg hover:bg-secondary transition-colors"
                  >
                    <p className="font-semibold text-primary">
                      {note.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[note.course, note.subject]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* =========================
   LEARNING SNAPSHOT SECTION
========================= */
function LearningSnapshotSection() {
  const authSession = useAuthSession();
  const user = authSession?.user ?? null;

  const [stats, setStats] = useState<{
    totalNotesViewed: number;
    subjectsExplored: number;
    mostViewedSubject: string | null;
    lastActiveAt: Date | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getUserLearningStats(user.uid)
      .then((data) => {
        if (data.totalNotesViewed > 0) {
          setStats(data);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.uid]);

  if (loading || !stats) {
    return null;
  }

  return (
    <Card className="mt-8 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="w-5 h-5" />
          Your Learning Snapshot
        </CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-secondary">
          <p className="text-sm text-muted-foreground">Notes Viewed</p>
          <p className="text-2xl font-bold">{stats.totalNotesViewed}</p>
        </div>

        <div className="p-4 rounded-lg bg-secondary">
          <p className="text-sm text-muted-foreground">Subjects Explored</p>
          <p className="text-2xl font-bold">{stats.subjectsExplored}</p>
        </div>

        <div className="p-4 rounded-lg bg-secondary">
          <p className="text-sm text-muted-foreground">Top Subject</p>
          <p className="font-semibold">
            {stats.mostViewedSubject ?? "—"}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-secondary">
          <p className="text-sm text-muted-foreground">Last Active</p>
          <p className="font-semibold">
            {stats.lastActiveAt
              ? stats.lastActiveAt.toLocaleDateString()
              : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


/* =========================
   DASHBOARD PAGE
========================= */

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-10 mb-8 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-blue-50/50 border">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Welcome to <span className="text-purple-700">pharmA2G</span>
        </h1>
        <p className="mt-2 text-slate-700 max-w-xl">
          Explore notes, practice for exams, or continue where you left off.
        </p>

        <div className="mt-4 flex gap-3 flex-wrap">
          <Button asChild>
            <Link href="/dashboard/notes">
              <Sparkles size={16} className="mr-2" />
              Explore Notes
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/mcq-practice">Start Practice</Link>
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardFeatures.map((f) => (
          <FeatureCard key={f.title} item={f} />
        ))}
      </section>
      
      <section>
        <LoginToPersonalizeCard />
      </section>

      {/* RECENTLY VIEWED */}
      <section>
        <RecentlyViewedSection />
      </section>

      {/* LEARNING SNAPSHOT */}
      <section>
        <LearningSnapshotSection />
      </section>
    </div>
  );
}
