"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ResultPage() {
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    try {
        const raw = sessionStorage.getItem("mockTestResult");
        if (raw) {
            const parsedResult = JSON.parse(raw);
            setResult(parsedResult);
        }
    } catch(e) {
        console.error("Failed to parse result from session storage", e);
    }
  }, []);

  if (!result) {
    return (
        <div className="p-10 text-center">
            <h1 className="text-xl font-semibold">No result found.</h1>
            <p className="text-muted-foreground mt-2">
                Please complete a mock test to see your results.
            </p>
            <Button className="mt-4" onClick={() => (window.location.href = "/dashboard/mock-test")}>
                Back to Tests
            </Button>
        </div>
    );
  }

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
