
"use client";

import React, { useEffect, useState } from "react";
import { fetchMockTests, type MockTest } from "@/services/mock-test";
import { Loader2, Play, Star, Timer, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function MockTestDashboardPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMockTests();
        setTests(data);
      } catch (err) {
        console.error("Mock test load failed:", err);
        setError("Failed to load mock tests.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin inline" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mock Tests</h1>
        <p className="text-gray-600">
          Full-length exam simulations (NTA style)
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white border rounded p-6 text-center text-gray-500">
          No mock tests available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((t) => (
            <div
              key={t.id}
              className="bg-gradient-to-br from-white to-purple-50/50 border border-purple-100 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-800 leading-tight">{t.title}</h3>
                  {t.isPremium && (
                     <div className="flex-shrink-0 ml-2">
                        <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Star className="w-3.5 h-3.5" />
                          Premium
                        </span>
                      </div>
                  )}
                </div>

                <p className="text-sm font-semibold text-primary/90">
                  {t.subject}
                </p>
              </div>
              <div className="mt-auto bg-purple-50/40 p-5 border-t border-purple-100">
                 <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary/70" />
                    <div>
                        <p className="font-semibold text-gray-800">{t.questionCount || 0}</p>
                        <p className="text-xs">Questions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary/70" />
                     <div>
                        <p className="font-semibold text-gray-800">{t.duration ?? "—"}</p>
                        <p className="text-xs">Minutes</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full font-bold" asChild>
                  <Link href={`/dashboard/mock-test/${t.id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Mock Test
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
