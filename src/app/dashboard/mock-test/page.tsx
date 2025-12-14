"use client";

import React, { useEffect, useState } from "react";
import { fetchPublishedMockTests, type MockTest } from "@/services/mock-test";
import { Loader2, Play, Timer, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MockTestDashboardPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchPublishedMockTests();
      setTests(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin w-6 h-6 inline" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((t) => (
            <div
              key={t.id}
              className="bg-white border rounded-lg shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg">{t.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t.subject} • {t.course}
                </p>

                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t.totalQuestions ?? "—"} Questions
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    {t.totalTime ?? "—"} Minutes
                  </div>
                </div>
              </div>

              <Button className="mt-5" disabled>
                <Play className="w-4 h-4 mr-2" />
                Start Mock Test
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
