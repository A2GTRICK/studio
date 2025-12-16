
"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Test = {
  id: string;
  title: string;
  subject?: string;
  category?: string;
  isPremium?: boolean;
  isPublished?: boolean;
  duration?: number;
  questionCount?: number;
  createdAt?: any;
};

const CATEGORIES = ["ALL", "RRB", "AIIMS", "GPAT"];

export default function MockTestListPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<Test[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState<"newest" | "duration">("newest");

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const q = query(
        collection(db, "test_series"),
        where("isPublished", "==", true)
      );

      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));

      setTests(data);
      setLoading(false);
    }

    load();
  }, []);

  /* ---------------- FILTER + SORT ---------------- */
  const visibleTests = useMemo(() => {
    let list = [...tests];

    // 🔍 Search
    if (search.trim()) {
      list = list.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🏷 Category
    if (category !== "ALL") {
      list = list.filter(t =>
        t.subject?.toUpperCase().includes(category)
      );
    }

    // ⬇ Sort
    if (sort === "newest") {
      list.sort((a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
    } else {
      list.sort((a, b) =>
        (a.duration || 0) - (b.duration || 0)
      );
    }

    return list;
  }, [tests, search, category, sort]);

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Mock Tests</h1>
        <p className="text-muted-foreground">
          Full-length exam simulations (NTA / RRB style)
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

        {/* SEARCH */}
        <Input
          placeholder="Search mock tests..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="md:max-w-xs"
        />

        {/* CATEGORY */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <Button
              key={c}
              size="sm"
              variant={category === c ? "default" : "outline"}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        {/* SORT */}
        <select
          className="border rounded px-3 py-2 text-sm"
          value={sort}
          onChange={e => setSort(e.target.value as any)}
        >
          <option value="newest">Newest First</option>
          <option value="duration">Duration (Short → Long)</option>
        </select>
      </div>

      {/* GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleTests.map(test => (
          <div
            key={test.id}
            className="border rounded-lg p-5 bg-white flex flex-col justify-between"
          >
            <div>
              <h3 className="font-semibold">{test.title}</h3>
              <p className="text-sm text-muted-foreground">
                {test.subject}
              </p>
              <div className="mt-2 text-sm">
                ⏱ {test.duration || 60} min
              </div>
            </div>

            <Link
              href={`/dashboard/mock-test/${test.id}`}
              className="mt-4"
            >
              <Button className="w-full">
                Start Mock Test
              </Button>
            </Link>
          </div>
        ))}

        {visibleTests.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No tests found.
          </div>
        )}
      </div>
    </div>
  );
}
