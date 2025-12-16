"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function InstructionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    loadTest();
  }, []);

  async function loadTest() {
    const snap = await getDoc(doc(db, "test_series", id));
    if (snap.exists()) {
      setTest(snap.data());
    }
    setLoading(false);
  }

  function startTest() {
    sessionStorage.setItem(`mocktest_${id}_accepted`, "true");
    sessionStorage.setItem(
      `mocktest_${id}_startTime`,
      Date.now().toString()
    );
    router.push(`/dashboard/mock-test/${id}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!test) {
    return <div className="p-10 text-center">Test not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{test.title}</h1>

        {/* TEST SUMMARY */}
        <div className="bg-white border rounded p-4 mb-6">
          <p><strong>Duration:</strong> {test.duration} minutes</p>
          <p><strong>Total Questions:</strong> Auto-calculated</p>
          <p><strong>Marks:</strong> As per CBT rules</p>
          <p><strong>Negative Marking:</strong> May apply</p>
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-white border rounded p-5 mb-6">
          <h2 className="font-semibold mb-2">
            Instructions (Read Carefully)
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Do not refresh or close the page during the test</li>
            <li>Each question carries equal marks</li>
            <li>Negative marking may apply</li>
            <li>No calculator is allowed</li>
            <li>Timer will not pause once started</li>
          </ul>
        </div>

        {/* ACCEPT */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>I have read and understood the instructions</span>
        </div>

        <Button
          disabled={!accepted}
          onClick={startTest}
          className="w-full"
        >
          Start Test
        </Button>
      </div>
    </div>
  );
}
