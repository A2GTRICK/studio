"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
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
  exam?: "RRB" | "AIIMS" | "GPAT" | string;
  duration?: number;
  isPremium?: boolean;
  price?: number;
}

export default function MockTestListPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<MockTest[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<"ALL" | "RRB" | "AIIMS" | "GPAT">("ALL");

  useEffect(() => {
    async function load() {
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
      const text =
        `${t.title} ${t.subject ?? ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ||
        (t.exam && t.exam.toUpperCase() === filter);

      return matchesSearch && matchesFilter;
    });
  }, [tests, search, filter]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4">
      {/* HEADER */}
      <h1 className="text-3xl font-bold">Mock Tests</h1>

      {/* SEARCH */}
      <Input
        placeholder="Search mock tests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "RRB", "AIIMS", "GPAT"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={clsx(
              "px-4 py-1 rounded-full border text-sm transition",
              filter === f
                ? "bg-primary text-white"
                : "bg-white text-muted-foreground hover:bg-muted"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground p-10">
          No mock tests found
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((test) => {
            const isPremium = test.isPremium === true;
            const price = test.price ?? 0;

            return (
              <div
                key={test.id}
                className="border rounded-xl p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex justify-between gap-3">
                    <h3 className="font-semibold leading-snug">
                      {test.title}
                    </h3>

                    {isPremium && (
                      <Badge className="bg-yellow-100 text-yellow-800 h-fit">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                    <Clock className="w-4 h-4" />
                    {test.duration || 0} min
                  </div>

                  {/* PRICE */}
                  {isPremium && (
                    <div className="mt-2 font-medium">
                      {price > 0 ? `₹${price}` : "Free"}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/dashboard/mock-test/${test.id}/instruction`}
                  className="mt-4"
                >
                  <Button className="w-full">
                    {isPremium && price > 0
                      ? "View & Buy"
                      : "Start Mock Test"}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
