"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Clock, Crown } from "lucide-react";
import clsx from "clsx";
import { Badge } from "@/components/ui/badge";

interface MockTest {
  id: string;
  title: string;
  subject?: string;
  exam?: string;
  duration?: number;
  isPremium?: boolean;
  price?: number | null;
  isPublished?: boolean;
}

export default function MockTestListPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "RRB" | "AIIMS" | "GPAT">("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);

      // ✅ SAFE QUERY (NO INDEX REQUIRED)
      const q = query(
        collection(db, "test_series"),
        where("isPublished", "==", true)
      );

      const snap = await getDocs(q);

      setTests(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }))
      );

      setLoading(false);
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.subject?.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" || t.exam === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tests, search, filter]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Mock Tests</h1>
        <p className="text-muted-foreground">
          Full-length exam simulations (NTA / RRB style)
        </p>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search mock tests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="flex gap-2">
        {["ALL", "RRB", "AIIMS", "GPAT"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={clsx(
              "px-4 py-1 rounded-full border text-sm",
              filter === f
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((test) => {
          const isPremium = test.isPremium === true;
          const price =
            typeof test.price === "number" ? test.price : null;

          return (
            <div
              key={test.id}
              className="border rounded-xl bg-white p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">
                    {test.title}
                  </h3>

                  {isPremium && (
                    <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </Badge>
                  )}
                </div>

                {test.subject && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {test.subject}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                  <Clock className="w-4 h-4" />
                  {test.duration || 0} min
                </div>

                {isPremium && price !== null && (
                  <div className="mt-2 text-sm font-medium text-primary">
                    ₹{price}
                  </div>
                )}
              </div>

              {/* ALWAYS GO TO INSTRUCTION PAGE */}
              <Link
                href={`/dashboard/mock-test/${test.id}/instruction`}
                className="mt-4"
              >
                <Button className="w-full">
                  {isPremium && price !== null
                    ? "View & Buy"
                    : "Start Mock Test"}
                </Button>
              </Link>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground p-10">
            No mock tests found
          </div>
        )}
      </div>
    </div>
  );
}
