"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, BookOpen, Clock } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";

interface MockTest {
  id: string;
  title: string;
  subject?: string;
  questionsCount: number;
  duration?: number; // minutes
}

export default function DashboardMockTestPage() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<MockTest[]>([]);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    setLoading(true);
    try {
      const testsRef = collection(db, "test_series");
      const q = query(testsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const resolved = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();

          const qSnap = await getDocs(
            collection(db, "test_series", doc.id, "questions")
          );

          return {
            id: doc.id,
            title: data.title ?? "Untitled Mock Test",
            subject: data.subject ?? "—",
            questionsCount: qSnap.size,
            duration: data.duration ?? 60,
          };
        })
      );

      // ✅ DO NOT FILTER ANY TEST
      setTests(resolved);
    } catch (err) {
      console.error("Failed to load mock tests", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mock Tests</h1>
        <p className="text-muted-foreground">
          Full-length exam simulations (NTA / RRB style)
        </p>
      </div>

      {tests.length === 0 ? (
        <div className="text-center p-10 text-muted-foreground">
          No mock tests available.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => {
            const isReady = test.questionsCount > 0;

            return (
              <div
                key={test.id}
                className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-card"
              >
                <h2 className="text-lg font-semibold mb-1">
                  {test.title}
                </h2>

                <p className="text-sm text-muted-foreground mb-3">
                  {test.subject}
                </p>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {test.questionsCount} Questions
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {test.duration} Min
                  </div>
                </div>

                {isReady ? (
                  <Link href={`/dashboard/mock-test/${test.id}`}>
                    <Button className="w-full">
                      Start Mock Test
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    variant="secondary"
                    className="w-full cursor-not-allowed"
                  >
                    Coming Soon
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
