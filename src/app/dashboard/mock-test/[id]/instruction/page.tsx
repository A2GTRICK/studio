"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  BookOpen,
  Monitor,
  AlertTriangle,
  Crown,
  ShieldCheck,
} from "lucide-react";

/* -------------------------------------------------
   HELPERS
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
   PAGE
-------------------------------------------------- */

export default function MockTestInstructionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const authSession = useAuthSession();
  const user = authSession?.user;

  const [test, setTest] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || authSession.loading) return;

    async function load() {
      try {
        const testSnap = await getDoc(doc(db, "test_series", id));
        if (!testSnap.exists()) {
          setTest(null);
          return;
        }

        setTest(testSnap.data());

        if (user?.uid) {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) setUserData(userSnap.data());
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, user, authSession.loading]);

  if (loading || authSession.loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!test) {
    return <div className="p-10 text-center">Mock test not found.</div>;
  }

  /* -------------------------------------------------
     ACCESS DECISION (FINAL)
  -------------------------------------------------- */

  const hasOverride =
    Array.isArray(userData?.grantedTestIds) &&
    userData.grantedTestIds.includes(id);

  const isLocked =
    test.isPremium === true &&
    !hasActivePremium(userData) &&
    !hasOverride;

  /* -------------------------------------------------
     PREMIUM LOCKED VIEW (FINAL UX)
  -------------------------------------------------- */

  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto mt-14 px-6">
        <div className="border rounded-2xl p-8 bg-white shadow-sm text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
            <Crown className="text-purple-700 w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold">
            Structured Premium Mock Test
          </h1>

          <p className="text-muted-foreground text-sm">
            This mock test is part of our carefully designed premium practice
            set, aligned with real exam patterns and difficulty levels.
          </p>

          <div className="bg-muted rounded-xl p-4 text-sm text-left space-y-2">
            <p>✔ Exam-level question balance</p>
            <p>✔ Timed CBT experience</p>
            <p>✔ Accurate self-assessment</p>
            <p>✔ No ads, no distractions</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            Secure access · Fair pricing · Instant unlock
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push("/dashboard/billing")}
          >
            Continue with Pro Access
          </Button>

          <button
            onClick={() => router.push("/dashboard/mock-test")}
            className="text-xs text-muted-foreground underline"
          >
            Explore free mock tests
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------
     INSTRUCTIONS (FREE / UNLOCKED)
  -------------------------------------------------- */

  function startTest() {
    try {
      document.documentElement.requestFullscreen?.();
    } catch {}
    router.push(`/dashboard/mock-test/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        Mock Test Instructions
      </h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <Instruction
          icon={<Clock />}
          title="Duration"
          text={`${test.duration || "N/A"} minutes · Auto submit on timeout`}
        />

        <Instruction
          icon={<BookOpen />}
          title="Question Pattern"
          text={`${
            test.questionCount || "Multiple"
          } questions · Equal marks · Negative marking may apply`}
        />

        <Instruction
          icon={<Monitor />}
          title="Navigation"
          text="You may navigate freely before final submission."
        />

        <Instruction
          icon={<AlertTriangle />}
          title="Important"
          text="Do not refresh or switch tabs during the test."
        />
      </div>

      <div className="flex justify-center">
        <Button size="lg" className="px-10" onClick={startTest}>
          I Agree & Start Test
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   COMPONENT
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
