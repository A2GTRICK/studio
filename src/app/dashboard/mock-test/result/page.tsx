"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mockTestResult");
    if (raw) setResult(JSON.parse(raw));
  }, []);

  if (!result) return <div className="p-10">No result</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Result</h1>
      <p>Total: {result.totalQuestions}</p>
      <p>Attempted: {result.attempted}</p>
      <p>Correct: {result.correct}</p>
      <p>Wrong: {result.wrong}</p>
      <p>Skipped: {result.skipped}</p>
      <p className="font-bold">Score: {result.score}</p>

      <Button onClick={() => location.href = "/dashboard/mock-test"}>
        Back to Tests
      </Button>
    </div>
  );
}
