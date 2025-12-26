
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import {
  Loader2,
  Clock,
  Crown,
  ChevronDown,
  Search,
  BookOpen,
  GraduationCap,
  Pill,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Award,
} from "lucide-react";

/* ================= ICON ================= */

const RupeeIcon = ({ className = "w-4 h-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="m6 13 8.5 8" />
    <path d="M6 13h3" />
    <path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
);

/* ================= THEMES ================= */

const EXAM_THEMES: Record<
  string,
  { bg: string; light: string; icon: JSX.Element }
> = {
  "RRB Pharmacist": {
    bg: "from-blue-600 to-blue-800",
    light: "bg-blue-50 text-blue-700",
    icon: <Pill className="w-6 h-6" />,
  },
  GPAT: {
    bg: "from-emerald-600 to-emerald-800",
    light: "bg-emerald-50 text-emerald-700",
    icon: <GraduationCap className="w-6 h-6" />,
  },
  "Diploma Exit Exam": {
    bg: "from-purple-600 to-purple-800",
    light: "bg-purple-50 text-purple-700",
    icon: <BookOpen className="w-6 h-6" />,
  },
  General: {
    bg: "from-slate-600 to-slate-800",
    light: "bg-slate-50 text-slate-700",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
};

const getTheme = (name: string) =>
  EXAM_THEMES[name?.trim()] || EXAM_THEMES["General"];

/* ================= PAGE ================= */

export default function MockTestVaultPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [openExam, setOpenExam] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const q = query(
        collection(db, "test_series"),
        where("isPublished", "==", true)
      );
      const snap = await getDocs(q);
      setTests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    tests.forEach((t) => {
      const exam = t.exam || t.category || "General";
      map[exam] ??= [];
      map[exam].push(t);
    });
    return map;
  }, [tests]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* HEADER */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <Award />
            </div>
            <div>
              <h1 className="font-black">
                MOCK <span className="text-blue-600">PREP</span>
              </h1>
              <p className="text-xs text-slate-400">Standardized Exams</p>
            </div>
          </div>

          <div className="relative w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests..."
              className="pl-10 pr-4 py-2 w-full rounded-xl border bg-slate-50"
            />
          </div>
        </div>
      </nav>

      {/* LIST */}
      <div className="max-w-7xl mx-auto px-6 mt-6 space-y-4">
        {Object.entries(grouped).map(([exam, list]) => {
          const theme = getTheme(exam);
          const active = openExam === exam;

          return (
            <div key={exam} className="bg-white rounded-3xl border">
              <button
                onClick={() => setOpenExam(active ? null : exam)}
                className="w-full p-6 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.bg} flex items-center justify-center text-white`}
                  >
                    {theme.icon}
                  </div>
                  <h2 className="text-xl font-black">{exam}</h2>
                </div>
                <ChevronDown
                  className={`transition ${active ? "rotate-180" : ""}`}
                />
              </button>

              {active && (
                <div className="px-6 pb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.map((test) => (
                    <div
                      key={test.id}
                      className="border rounded-2xl p-5 flex flex-col bg-white"
                    >
                      <h4 className="font-bold mb-3">{test.title}</h4>

                      {/* SAFE METADATA (NO COUNT) */}
                      <div className="flex gap-4 text-xs text-slate-500 mb-4">
                        <span className="flex gap-1 items-center">
                          <Clock className="w-3 h-3" />
                          {test.duration || 60} min
                        </span>

                        <span className="flex gap-1 items-center">
                          <BookOpen className="w-3 h-3" />
                          Practice Module
                        </span>
                      </div>

                      <div className="mt-auto flex justify-between items-center">
                        {test.price ? (
                          <span className="font-black">₹{test.price}</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">
                            FREE
                          </span>
                        )}

                        <Link
                          href={`/dashboard/mock-test/${test.id}/instruction`}
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black"
                        >
                          ATTEMPT
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
