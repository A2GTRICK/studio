
"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Clock,
  Monitor,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import PremiumGuard from "@/components/premium/PremiumGuard";

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
  const [starting, setStarting] = useState(false);

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
      } catch(e) {
        console.error("Failed to load test data", e);
      }
      finally {
        setLoading(false);
      }
    }

    load();
  }, [id, user, authSession.loading]);

  async function handleStartTest() {
    setStarting(true);
    try {
      const idToken = await user?.getIdToken();
      const res = await fetch("/api/mock-test/start", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ testId: id }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Access denied. Please check your subscription.");
        if (data.error === "Payment required") {
            router.push(`/dashboard/billing?testId=${id}`);
        }
        return;
      }

      try {
        document.documentElement.requestFullscreen?.();
      } catch {}
      router.push(`/dashboard/mock-test/${id}?start=1`);

    } catch (err: any) {
        alert("An error occurred while starting the test: " + err.message);
    } finally {
        setStarting(false);
    }
  }

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

  const hasOverride =
    Array.isArray(userData?.grantedTestIds) &&
    userData.grantedTestIds.includes(id);

  const canAccess =
    test.isPremium !== true ||
    hasActivePremium(userData) ||
    hasOverride;


  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">
        {test.title}
      </h1>

      <PremiumGuard
        isPremium={test.isPremium === true}
        canAccess={canAccess}
        contentType="test"
        contentId={id}
        price={test.price}
      >
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
          <Button size="lg" className="px-10" onClick={handleStartTest} disabled={starting}>
            {starting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {starting ? "Verifying..." : "I Agree & Start Test"}
          </Button>
        </div>
      </PremiumGuard>
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
        <div className="text-sm text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}
