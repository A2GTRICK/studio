
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchMockTests, type MockTest as RawMockTest } from "@/services/mock-test";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MockTestCard from "@/components/mock-test-card";

// Enriched type with a guaranteed 'exam' field
export type MockTest = RawMockTest & {
  exam: "GPAT" | "RRB" | "EXIT" | "GENERAL";
};

// Function to derive exam type from title/subject
function getExamCategory(test: RawMockTest): MockTest['exam'] {
    const title = test.title.toLowerCase();
    const subject = (test.subject || '').toLowerCase();
    
    if (title.includes('gpat') || subject.includes('gpat')) return 'GPAT';
    if (title.includes('rrb') || title.includes('railway')) return 'RRB';
    if (title.includes('exit exam') || title.includes('exit')) return 'EXIT';
    
    return 'GENERAL';
}


export default function MockTestDashboardPage() {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("ALL");
  const [premiumFilter, setPremiumFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMockTests();
        // Normalize data on fetch
        const normalizedData = data.map(t => ({
            ...t,
            exam: getExamCategory(t)
        }));
        setTests(normalizedData);
      } catch (err) {
        console.error("Mock test load failed:", err);
        setError("Failed to load mock tests.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  
  const filteredTests = useMemo(() => {
     return tests.filter((t) => {
        const qCount = t.questions?.length || 0;

        // Search
        const matchesSearch =
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.subject?.toLowerCase().includes(search.toLowerCase());

        // Exam filter
        const matchesExam =
            examFilter === "ALL" || t.exam === examFilter;

        // Premium filter
        const matchesPremium =
            premiumFilter === "ALL" ||
            (premiumFilter === "FREE" && !t.isPremium) ||
            (premiumFilter === "PREMIUM" && t.isPremium);

        return matchesSearch && matchesExam && matchesPremium && qCount > 0;
    });
  }, [tests, search, examFilter, premiumFilter]);

  const groupedTests = useMemo(() => {
    return filteredTests.reduce((acc, test) => {
        const examKey = test.exam;
        if (!acc[examKey]) {
            acc[examKey] = [];
        }
        acc[examKey].push(test);
        return acc;
    }, {} as Record<string, MockTest[]>);
  }, [filteredTests]);


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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mock Tests</h1>
        <p className="text-gray-600">
          Full-length exam simulations (NTA style)
        </p>
      </div>

       {/* Filter and Search Controls */}
      <div className="bg-background/70 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search mock tests..."
                    className="pl-9"
                />
            </div>
             <Select value={examFilter} onValueChange={setExamFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Exams</SelectItem>
                    <SelectItem value="GPAT">GPAT</SelectItem>
                    <SelectItem value="RRB">RRB Pharmacist</SelectItem>
                    <SelectItem value="EXIT">Exit Exam</SelectItem>
                    <SelectItem value="GENERAL">General Practice</SelectItem>
                </SelectContent>
            </Select>
             <Select value={premiumFilter} onValueChange={setPremiumFilter}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-lg p-12 text-center text-gray-500">
          <h3 className="text-xl font-semibold">No Mock Tests Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
            {Object.entries(groupedTests).map(([exam, examTests]) => (
              <div key={exam} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
                  {exam === "RRB" ? "RRB Pharmacist" : exam.charAt(0).toUpperCase() + exam.slice(1).toLowerCase()} Mock Tests
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {examTests.map((t) => (
                    <MockTestCard key={t.id} test={t} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
