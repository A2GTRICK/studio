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
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const snap = await getDoc(doc(db, "test_series", id));
    if (!snap.exists()) {
      router.push("/dashboard/mock-test");
      return;
    }

    const d = snap.data();
    setTitle(d.title || "Mock Test");
    setInstructions(
      d.instructions?.content ||
        `• Total questions: Auto-calculated
• Each question carries equal marks
• Negative marking may apply
• No calculator allowed
• Do not refresh or switch tabs
• Test runs in fullscreen mode
• 3 violations allowed, 4th auto-submit`
    );
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white border rounded-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="bg-slate-100 p-4 rounded text-sm whitespace-pre-line">
          {instructions}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              router.push(`/dashboard/mock-test/${id}?start=1`)
            }
          >
            I Agree & Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}
