
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ResultData = {
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
};

export default function CBTResultPage() {
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mockTestResult");
    if (raw) {
      setResult(JSON.parse(raw));
    }
  }, []);

  if (!result) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Result not found.
      </div>
    );
  }

  const accuracy =
    result.attempted > 0
      ? ((result.correct / result.attempted) * 100).toFixed(2)
      : "0.00";

  let performance = "Needs Improvement";
  if (Number(accuracy) >= 75) performance = "Excellent";
  else if (Number(accuracy) >= 60) performance = "Good";

  const chartData = [
    { name: "Correct", value: result.correct },
    { name: "Wrong", value: result.wrong },
    { name: "Skipped", value: result.skipped },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Mock Test Result</h1>
        <p className="text-muted-foreground">
          CBT-style performance summary
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Stat label="Total" value={result.totalQuestions} />
        <Stat label="Attempted" value={result.attempted} />
        <Stat label="Correct" value={result.correct} />
        <Stat label="Wrong" value={result.wrong} />
        <Stat label="Skipped" value={result.skipped} />
        <Stat
          label="Score"
          value={result.score}
          highlight
        />
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PERFORMANCE */}
        <div className="border rounded-xl p-6 space-y-3 bg-card">
          <h2 className="font-semibold text-lg">
            Performance Analysis
          </h2>
          <p>
            <strong>Accuracy:</strong> {accuracy}%
          </p>
          <p>
            <strong>Performance:</strong>{" "}
            <span className="font-semibold">
              {performance}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            (Negative marking applied: −0.25 per wrong answer)
          </p>
        </div>

        {/* CHART */}
        <div className="border rounded-xl p-6 bg-card">
          <h2 className="font-semibold text-lg mb-4">
            Question Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() =>
            (location.href = "/dashboard/mock-test")
          }
        >
          Back to Mock Tests
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            (location.href = "/dashboard/mock-test/review")
          }
        >
          Review Answers
        </Button>
      </div>
    </div>
  );
}

/* ------------------ STAT CARD ------------------ */
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
    <div
      className={`rounded-xl p-4 text-center ${
        highlight
          ? "bg-purple-100 text-purple-800"
          : "bg-slate-100"
      }`}
    >
      <div className="text-sm text-muted-foreground">
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
