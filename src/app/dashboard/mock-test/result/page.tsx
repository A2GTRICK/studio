
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Result = {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
};

export default function MockTestResultPage() {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mockTestResult");
    if (raw) {
      setResult(JSON.parse(raw));
    }
  }, []);

  if (!result) {
    return <div className="p-10">Result not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Mock Test Result
      </h1>

      <div className="grid grid-cols-2 gap-4 bg-white border rounded-xl p-6">
        <Stat label="Total Questions" value={result.totalQuestions} />
        <Stat label="Attempted" value={result.attempted} />
        <Stat label="Correct" value={result.correct} />
        <Stat label="Wrong" value={result.wrong} />
        <Stat label="Skipped" value={result.skipped} />
        <Stat label="Final Score" value={result.score} highlight />
      </div>

      <div className="text-center">
        <Button onClick={() => location.href = "/dashboard/mock-test"}>
          Back to Mock Tests
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg ${highlight ? "bg-purple-100" : "bg-slate-50"}`}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? "text-purple-700" : ""}`}>
        {value}
      </div>
    </div>
  );
}
