"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  Loader2,
  Search,
  GraduationCap,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import MockTestCard from "@/components/mock-test-card";

interface MockTest {
  id: string;
  title: string;
  subject?: string;
  exam?: string;
  duration?: number;
  isPremium?: boolean;
  price?: number;
  questionCount?: number;
}

export default function MockTestVaultPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [search, setSearch] = useState("");
  const [openExam, setOpenExam] = useState<string | null>(null);
  const [openSubject, setOpenSubject] = useState<Record<string, string | null>>(
    {}
  );

  /* =========================
     DATA LOAD
  ========================= */
  useEffect(() => {
    async function load() {
      const q = query(
        collection(db, "test_series"),
        where("isPublished", "==", true),
        orderBy("createdAt", "desc")
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as MockTest
      );

      setTests(data);
      if (data.length > 0) {
        setOpenExam(data[0]?.exam || "General");
      }
      setLoading(false);
    }
    load();
  }, []);

  /* =========================
     ORGANIZE → Exam → Subject
  ========================= */
  const tree = useMemo(() => {
    const structure: Record<string, Record<string, MockTest[]>> = {};

    tests
      .filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.subject?.toLowerCase().includes(search.toLowerCase())
      )
      .forEach((test) => {
        const exam = test.exam || "General";
        const subject = test.subject || "General";

        if (!structure[exam]) structure[exam] = {};
        if (!structure[exam][subject]) structure[exam][subject] = [];

        structure[exam][subject].push(test);
      });

    return structure;
  }, [tests, search]);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-16 md:top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-xl">
              <GraduationCap size={20} />
            </div>
            <h1 className="text-xl font-black">Mock Test Vault</h1>
          </div>

          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search mock tests..."
              className="pl-12 rounded-2xl bg-slate-100 font-semibold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* VAULT */}
      <main className="max-w-6xl mx-auto mt-6 px-4 space-y-6">
        {Object.keys(tree).length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl">
            No mock tests found.
          </div>
        )}

        {Object.entries(tree).map(([exam, subjects]) => (
          <div
            key={exam}
            className="bg-white rounded-3xl border shadow-sm overflow-hidden"
          >
            {/* EXAM HEADER */}
            <button
              onClick={() => setOpenExam(openExam === exam ? null : exam)}
              className="w-full flex items-center justify-between p-6 border-l-4 border-primary"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                  <GraduationCap />
                </div>
                <div>
                  <h2 className="font-black text-lg text-left">{exam}</h2>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                    <ShieldCheck size={14} /> VERIFIED EXAM SERIES
                  </div>
                </div>
              </div>

              <ChevronDown
                className={`transition ${
                  openExam === exam ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* SUBJECTS */}
            {openExam === exam && (
              <div className="p-4 space-y-4 bg-slate-50">
                {Object.entries(subjects).map(([subject, tests]) => {
                  const key = `${exam}-${subject}`;
                  const open = openSubject[exam] === subject;

                  return (
                    <div
                      key={key}
                      className="bg-white rounded-2xl border overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenSubject((p) => ({
                            ...p,
                            [exam]: open ? null : subject,
                          }))
                        }
                        className="w-full flex justify-between items-center p-4"
                      >
                        <div>
                          <h3 className="font-bold text-left">{subject}</h3>
                          <p className="text-xs text-muted-foreground text-left">
                            {tests.length} tests · Exam focused
                          </p>
                        </div>
                        <ChevronDown
                          className={`transition ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {open && (
                        <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-100">
                          {tests.map((test) => (
                            <MockTestCard key={test.id} test={test} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
