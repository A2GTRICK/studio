
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ResultData = {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: string;
};

export default function MockTestResultPage() {
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    // Read the consolidated result object
    const raw = sessionStorage.getItem("mockTestResult");
    if (!raw) return;
    try {
        // The result data is now nested inside a 'result' property
        const data = JSON.parse(raw);
        setResult(data.result || data); // Fallback for old structure
    } catch(e) {
        console.error("Failed to parse result data", e);
    }
  }, []);

  if (!result) {
    return (
      <div className="p-10 text-center text-gray-600">
        Result not found or is loading...
      </div>
    );
  }

  const percentage = parseFloat(((Number(result.score) / result.totalQuestions) * 100).toFixed(2));
  
  let performance = "Needs Improvement";
  if (percentage >= 75) {
    performance = "Excellent";
  } else if (percentage >= 60) {
    performance = "Good";
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
        <Stat label="Final Score" value={Number(result.score)} highlight />
        <div className="p-4 rounded-lg bg-slate-50">
          <div className="text-sm text-gray-500">Score Percentage</div>
          <div className="text-2xl font-bold">{percentage}%</div>
        </div>
        <div className="p-4 rounded-lg bg-slate-50">
          <div className="text-sm text-gray-500">Performance</div>
          <div className="text-2xl font-bold">{performance}</div>
        </div>
      </div>

      <div className="text-center flex flex-col gap-3">
        <Button onClick={() => location.href = "/dashboard/mock-test"}>
          Back to Mock Tests
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            location.href = "/dashboard/mock-test/review"
          }
        >
          Review Answers
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
