
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
  ArrowLeft, 
  History, 
  ChevronDown, 
  Search,
  BookOpen,
  GraduationCap,
  Pill,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Award,
  CircleDot
} from "lucide-react";

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

const EXAM_THEMES: Record<string, { bg: string; light: string; icon: JSX.Element; accent: string; }> = {
  "RRB Pharmacist": {
    bg: "from-[#2563eb] to-[#1e40af]",
    light: "bg-blue-50 text-blue-700 border-blue-100",
    icon: <Pill className="w-6 h-6" />,
    accent: "blue"
  },
  "GPAT": {
    bg: "from-[#059669] to-[#065f46]",
    light: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: <GraduationCap className="w-6 h-6" />,
    accent: "emerald"
  },
  "Diploma Exit Exam": {
    bg: "from-[#7c3aed] to-[#5b21b6]",
    light: "bg-purple-50 text-purple-700 border-purple-100",
    icon: <BookOpen className="w-6 h-6" />,
    accent: "purple"
  },
  "General": {
    bg: "from-slate-600 to-slate-800",
    light: "bg-slate-50 text-slate-700 border-slate-200",
    icon: <ShieldCheck className="w-6 h-6" />,
    accent: "slate"
  }
};

const getTheme = (name: string) => {
  const normalized = name?.trim();
  return EXAM_THEMES[normalized] || EXAM_THEMES["General"];
};

export default function MockTestVaultPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [openExam, setOpenExam] = useState<string | null>(null);
  const [openSubject, setOpenSubject] = useState<Record<string, string | null>>({});

  useEffect(() => {
    async function loadTests() {
      try {
        const q = query(
          collection(db, "test_series"),
          where("isPublished", "==", true)
        );
        const snap = await getDocs(q);
        setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("Fetch Error:", e); }
      finally { setLoading(false); }
    }
    loadTests();
  }, []);

  const tree = useMemo(() => {
    const res: Record<string, Record<string, any[]>> = {};
    const filtered = tests.filter(t => 
      [t.title, t.subject, t.exam, t.category, t.examType].some(f => f?.toLowerCase().includes(search.toLowerCase()))
    );

    filtered.forEach(t => {
      const e = t.exam || t.category || t.examType || "General";
      const s = t.subject || "Common Topics";
      
      if (!res[e]) res[e] = {};
      if (!res[e][s]) res[e][s] = [];
      res[e][s].push(t);
    });
    return res;
  }, [tests, search]);

  const toggleExam = (exam: string) => {
    setOpenExam(prev => (prev === exam ? null : exam));
  };

  const toggleSubject = (exam: string, sub: string) => {
    setOpenSubject(prev => ({
      ...prev,
      [exam]: prev[exam] === sub ? null : sub
    }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      <span className="text-slate-500 font-bold animate-pulse">Initializing Premium Vault...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12 antialiased font-sans">
      <nav className="sticky top-16 md:top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">MOCK <span className="text-blue-600">PREP</span></h1>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none">Standardized Exams</p>
            </div>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Exam, Subject or Title..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-100/50 border border-slate-200/50 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Tests", val: tests.length, icon: <BookOpen />, color: "blue" },
            { label: "Trending", val: "4.8k", icon: <TrendingUp />, color: "emerald" },
            { label: "Pro Content", val: tests.filter(t => t.isPremium).length, icon: <Crown />, color: "amber" },
            { label: "Exams", val: Object.keys(tree).length, icon: <CircleDot />, color: "purple" }
          ].map((s, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl border border-slate-200/60 shadow-sm flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-${s.color}-50 text-${s.color}-600 hidden sm:block`}>{s.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{s.label}</p>
                <p className="text-lg font-black text-slate-800">{s.val}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {Object.keys(tree).length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
               <div className="inline-block p-6 bg-slate-50 rounded-full mb-4 text-slate-300"><Search className="w-12 h-12" /></div>
               <h2 className="text-2xl font-bold text-slate-700">No matches found</h2>
               <p className="text-slate-400">We couldn't find any exams matching your search.</p>
            </div>
          ) : (
            Object.entries(tree).map(([exam, subjects]) => {
              const theme = getTheme(exam);
              const active = openExam === exam;
              return (
                <div key={exam} className={`transition-all duration-500 rounded-[2.5rem] overflow-hidden ${active ? 'bg-white shadow-2xl shadow-slate-200 ring-1 ring-slate-200' : 'bg-white/50 hover:bg-white shadow-sm'}`}>
                  <button 
                    onClick={() => toggleExam(exam)}
                    className="w-full flex items-center justify-between p-6 sm:p-8 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-[1.8rem] bg-gradient-to-br ${theme.bg} flex items-center justify-center text-white shadow-2xl shadow-${theme.accent}-500/30 group-hover:scale-110 transition-transform duration-500`}>
                        {theme.icon}
                      </div>
                      <div className="text-left">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-2 inline-block border ${theme.light}`}>
                          Official Category
                        </span>
                        <h2 className="text-2xl font-black text-slate-800">{exam}</h2>
                      </div>
                    </div>
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${active ? 'bg-slate-900 text-white rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                      <ChevronDown className="w-6 h-6" />
                    </div>
                  </button>

                  {active && (
                    <div className="px-6 pb-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      {Object.entries(subjects).map(([subject, testList]) => {
                        const subActive = openSubject[exam] === subject;
                        return (
                          <div key={subject} className="bg-slate-50/50 rounded-3xl overflow-hidden border border-slate-200/40">
                            <button 
                              onClick={() => toggleSubject(exam, subject)}
                              className="w-full p-5 flex items-center justify-between hover:bg-slate-100/50 transition-colors"
                            >
                              <div className="flex items-center gap-4 text-left">
                                <div className="w-1.5 h-6 bg-blue-500/40 rounded-full" />
                                <div>
                                  <h3 className="font-bold text-slate-700 leading-none">{subject}</h3>
                                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">{testList.length} Practice Modules</p>
                                </div>
                              </div>
                              <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${subActive ? 'rotate-90 text-blue-600' : 'text-slate-300'}`} />
                            </button>

                            {subActive && (
                              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-slate-200/40 animate-in zoom-in-95 duration-300">
                                {testList.map(test => (
                                  <div key={test.id} className="group/card bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-400 transition-all duration-300 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                      <div className="p-2.5 bg-slate-50 rounded-2xl group-hover/card:bg-blue-50 transition-colors">
                                        <BookOpen className="w-4 h-4 text-slate-400 group-hover/card:text-blue-500" />
                                      </div>
                                      {test.isPremium && (
                                        <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-sm shadow-amber-200/50">
                                          <Crown className="w-3 h-3" /> PRO
                                        </div>
                                      )}
                                    </div>
                                    
                                    <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover/card:text-blue-600 transition-colors mb-4 min-h-[3rem]">{test.title}</h4>
                                    
                                    <div className="flex items-center gap-4 mb-6">
                                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                                        <Clock className="w-3.5 h-3.5" /> {test.duration || 45}m
                                      </div>
                                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                                        <BookOpen className="w-3.5 h-3.5" /> Practice Module
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                                      <div className="flex items-center gap-1 text-slate-900">
                                        {test.price > 0 ? (
                                          <div className="flex items-center font-black">
                                            <RupeeIcon className="w-3.5 h-3.5 mr-0.5" />
                                            <span>{test.price}</span>
                                          </div>
                                        ) : (
                                          <span className="text-emerald-600 text-xs font-black tracking-widest uppercase">Free</span>
                                        )}
                                      </div>
                                      <Link href={`/dashboard/mock-test/${test.id}/instruction`} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-[11px] font-black rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10">
                                        ATTEMPT <ChevronRight className="w-3 h-3" />
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
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-50" />
    </div>
  );
}
