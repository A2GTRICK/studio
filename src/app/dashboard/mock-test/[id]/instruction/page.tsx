
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Monitor, BookOpen, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

// --- Helper functions for access control ---
function daysBetween(date?: string | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function hasActivePremium(userData: any) {
  if (userData?.isLifetime) return true;
  const days = daysBetween(userData?.premiumUntil);
  return days !== null && days >= 0;
}

export default function MockTestInstructionPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;
  const authSession = useAuthSession();
  const user = authSession?.user;

  const [mockTest, setMockTest] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!testId || authSession.loading) return;

    async function loadData() {
      setLoading(true);
      try {
        const testRef = doc(db, "test_series", testId);
        const testSnap = await getDoc(testRef);

        if (!testSnap.exists()) {
          setMockTest(null);
          return;
        }
        const testData = testSnap.data();
        setMockTest(testData);

        if (user?.uid) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }
      } catch (error) {
        console.error("Failed to load test/user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [testId, user, authSession.loading]);

  function startTest() {
    try {
      document.documentElement.requestFullscreen?.();
    } catch {}
    window.location.href = `/dashboard/mock-test/${testId}`;
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!mockTest) {
    return <div className="p-10 text-center">Test not found.</div>;
  }

  const isLocked =
    mockTest.isPremium === true &&
    !hasActivePremium(userData) &&
    !userData?.grantedTestIds?.includes(testId) &&
    !userData?.premiumOverrideIds?.includes(testId);

  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center space-y-4 p-8 border rounded-xl bg-card shadow-sm">
        <div className="text-5xl">🔒</div>

        <h1 className="text-xl font-bold">Premium Mock Test</h1>

        <p className="text-muted-foreground">
          This mock test is available for premium users only.
        </p>

        <p className="text-sm text-muted-foreground">
          Upgrade to premium to unlock this test and many other features.
        </p>

        <Button onClick={() => router.push("/dashboard/billing")}>
          Upgrade to Premium
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Mock Test Instructions
      </h1>

      {/* INSTRUCTIONS */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <Instruction
          icon={<Clock />}
          title="Test Duration"
          text="The test is time-bound. The timer will start immediately once you begin the test."
        />

        <Instruction
          icon={<BookOpen />}
          title="Question Pattern"
          text="Each question carries equal marks. Some questions have negative marking for incorrect answers."
        />

        <Instruction
          icon={<Monitor />}
          title="Navigation"
          text="You can move between questions using Next and Previous buttons. Answers can be changed before submission."
        />

        <Instruction
          icon={<AlertTriangle />}
          title="Auto Submission"
          text="The test will be automatically submitted when the timer reaches zero."
        />
      </div>

      {/* WARNINGS */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-amber-800 text-lg">
          Important Warnings
        </h2>

        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
          <li>Do not refresh the page during the test.</li>
          <li>Do not close the browser until submission.</li>
          <li>Test progress is not saved if the page is reloaded.</li>
          <li>This is a practice mock test for self-assessment.</li>
        </ul>
      </div>

      {/* ACTION */}
      <div className="flex justify-center">
        <Button size="lg" className="px-10" onClick={startTest}>
          Start Mock Test
        </Button>
      </div>
    </div>
  );
}

function Instruction({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="text-primary mt-1">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-600">{text}</div>
      </div>
    </div>
  );
}
