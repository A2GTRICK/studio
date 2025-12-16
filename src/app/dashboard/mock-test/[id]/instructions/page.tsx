"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Loader2 } from "lucide-react";

export default function InstructionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "test_series", id));
      if (snap.exists()) {
        const d = snap.data();
        setTitle(d.title || "Mock Test");
        setInstructions(
          d.instructions ||
            `• Read all questions carefully
• Each question carries equal marks
• Negative marking may apply
• No calculator allowed
• Do not refresh the page during test`
        );
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white border rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">{title}</h1>

        <h2 className="font-semibold">CBT Instructions</h2>

        <pre className="whitespace-pre-wrap text-sm bg-slate-100 p-4 rounded">
          {instructions}
        </pre>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          I have read and understood the instructions
        </label>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/mock-test")}
          >
            Back
          </Button>

          <Button
            disabled={!checked}
            onClick={() => {
              sessionStorage.setItem(
                `mocktest_${id}_accepted`,
                "true"
              );
              router.replace(`/dashboard/mock-test/${id}`);
            }}
          >
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}
