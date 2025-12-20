
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  Monitor,
  BookOpen,
  Loader2,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

/* -------------------------------------------------
   Helper functions (UNCHANGED)
-------------------------------------------------- */

function daysBetween(date?: string | null) {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function hasActivePremium(userData: any) {
  if (!userData) return false;
  if (userData.isLifetime) return true;
  const days = daysBetween(userData?.premiumUntil);
  return days !== null && days >= 0;
}

/* -------------------------------------------------
   Page
-------------------------------------------------- */

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

        setMockTest(testSnap.data());

        if (user?.uid) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }
      } catch (err) {
        console.error(err);
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

  /* -------------------------------------------------
     ACCESS LOGIC (UNCHANGED)
  -------------------------------------------------- */

  const isLocked =
    mockTest.isPremium === true &&
    !hasActivePremium(userData) &&
    !(Array.isArray(userData?.grantedTestIds) &&
      userData.grantedTestIds.includes(testId)) &&
    !(Array.isArray(userData?.premiumOverrideIds) &&
      userData.premiumOverrideIds.includes(testId));

  const premiumPrice =
    typeof mockTest.price === "number" ? mockTest.price : null;

  /* -------------------------------------------------
     LOCKED (TRUST-FIRST PREMIUM VIEW)
  -------------------------------------------------- */

  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-8 rounded-2xl border bg-white shadow-sm space-y-6 text-center">

        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center">
            <Crown className="text-yellow-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold">
          Premium Mock Test
        </h1>

        <p className="text-muted-foreground text-sm">
          This mock test is part of our premium practice set, designed to
          closely match real exam difficulty and pattern.
        </p>

        <div className="text-left bg-muted/40 rounded-xl p-4 text-sm space-y-2">
          <p className="font-medium">What you get:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Exam-level questions with proper difficulty balance</li>
            <li>Timed CBT experience</li>
            <li>Accurate self-assessment</li>
            <li>No distractions, no ads</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4" />
          One-time unlock • Secure payment • Instant access
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={() =>
            router.push(
              premiumPrice
                ? `/dashboard/billing?test=${testId}`
                : "/dashboard/billing"
            )
          }
        >
          {premiumPrice
            ? `Unlock Test • ₹${premiumPrice}`
            : "Upgrade to Premium"}
        </Button>

        <p className="text-xs text-muted-foreground">
          You can continue using free tests anytime.
        </p>
      </div>
    );
  }

  /* -------------------------------------------------
     INSTRUCTIONS (NORMAL FLOW)
  -------------------------------------------------- */

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">

      <h1 className="text-3xl font-bold text-center">
        Mock Test Instructions
      </h1>

      <div className="bg-white border rounded-2xl p-6 space-y-4">
        <Instruction
          icon={<Clock />}
          title="Test Duration"
          text={`The test is time-bound for ${
            mockTest.duration || "N/A"
          } minutes. The timer starts immediately after you begin.`}
        />

        <Instruction
          icon={<BookOpen />}
          title="Question Pattern"
          text={`There are ${
            mockTest.questionCount || "multiple"
          } questions. Each question carries equal marks. Negative marking may apply.`}
        />

        <Instruction
          icon={<Monitor />}
          title="Navigation"
          text="You can move between questions freely before submission."
        />

        <Instruction
          icon={<AlertTriangle />}
          title="Auto Submission"
          text="The test will auto-submit when time ends."
        />
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-5">
        <h2 className="font-semibold text-amber-800 mb-2">
          Important Notes
        </h2>
        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
          <li>Do not refresh or close the browser.</li>
          <li>Switching tabs may affect performance.</li>
          <li>This test is for practice and self-evaluation.</li>
        </ul>
      </div>

      <div className="flex justify-center">
        <Button size="lg" className="px-12" onClick={startTest}>
          Start Mock Test
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Instruction Component
-------------------------------------------------- */

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
        <div className="text-sm text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}
