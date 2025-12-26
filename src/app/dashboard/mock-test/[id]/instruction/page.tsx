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
  Sparkles,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

/* ======================================================
   HELPERS (UNCHANGED)
====================================================== */

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

/* ======================================================
   PAGE
====================================================== */

export default function MockTestInstructionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthSession();

  const [test, setTest] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id || authLoading) return;

    (async () => {
      setLoading(true);
      try {
        const testSnap = await getDoc(doc(db, "test_series", id));
        if (!testSnap.exists()) {
          setTest(null);
          return;
        }
        setTest(testSnap.data());

        if (user?.uid) {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, authLoading]);

  /* ======================================================
     ACCESS LOGIC (UNCHANGED)
  ===================================================== */

  const isPremiumTest = test?.isPremium === true;
  const hasGrant = userData?.grantedTestIds?.includes(id);
  const isPro = hasActivePremium(userData);
  const canAccess = !isPremiumTest || isPro || hasGrant;

  /* ======================================================
     PAYMENT LOGIC (UNCHANGED)
  ===================================================== */

  const handleSinglePurchase = async () => {
    if (!id || !test?.price || !user) return;

    if (!user.emailVerified) {
      toast({
        variant: "destructive",
        title: "Email verification required",
        description: "Please verify your email before purchasing.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: test.price,
          plan: "single_test",
          contentId: id,
        }),
      });

      const order = await orderRes.json();

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "pharmA2G",
        description: test.title,
        order_id: order.id,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              userId: user.uid,
              plan: "single_test",
              contentId: id,
              amount: order.amount,
            }),
          });

          const result = await verifyRes.json();

          if (result.success) {
            toast({
              title: "Access granted",
              description: "You can now start the test.",
            });
            window.location.reload();
          } else {
            throw new Error("Payment verification failed");
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: { color: "#4F46E5" },
      });

      razorpay.open();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: err.message || "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  function handleStartTest() {
    if (!user) {
      router.push(`/auth/login?redirect=/dashboard/mock-test/${id}/instruction`);
      return;
    }
    sessionStorage.setItem(`mocktest_${id}_accepted`, "true");
    router.push(`/dashboard/mock-test/${id}`);
  }

  /* ======================================================
     STATES
  ===================================================== */

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-slate-500" />
      </div>
    );
  }

  if (!test) {
    return <div className="p-10 text-center">Test not found.</div>;
  }

  /* ======================================================
     PREMIUM LOCK VIEW
  ===================================================== */

  if (!canAccess) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white border rounded-2xl p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <Crown className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold">Premium Mock Test</h1>
        <p className="text-sm text-muted-foreground">
          This test is part of our verified CBT practice series.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 text-sm text-left space-y-2">
          <Feature text="Exam-level questions curated by experts" />
          <Feature text="CBT-style timer & navigation" />
          <Feature text="Performance analysis after submission" />
        </div>

        {test.price > 0 && (
          <Button
            onClick={handleSinglePurchase}
            disabled={isProcessing}
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isProcessing ? "Processing..." : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Buy this test for ₹{test.price}
              </>
            )}
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => router.push("/dashboard/billing")}
        >
          Continue with Pro
        </Button>

        <button
          onClick={() => router.push("/dashboard/mock-test")}
          className="text-xs text-muted-foreground underline"
        >
          Explore free mock tests
        </button>
      </div>
    );
  }

  /* ======================================================
     INSTRUCTIONS VIEW
  ===================================================== */

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{test.title}</h1>
        <p className="text-sm text-muted-foreground">
          Please read the instructions carefully before starting the test
        </p>
      </div>

      <div className="bg-white border rounded-2xl divide-y">
        <Instruction icon={<Clock />} title="Duration" text={`${test.duration || 60} minutes`} />
        <Instruction icon={<BookOpen />} title="Question Pattern" text="Multiple-choice questions • Negative marking may apply" />
        <Instruction icon={<Monitor />} title="Navigation" text="You can move freely between questions and change answers" />
        <Instruction icon={<AlertTriangle />} title="Auto Submission" text="The test will be submitted automatically when time ends" />
        <Instruction icon={<ShieldCheck />} title="Fair Practice" text="Do not refresh or close the browser during the test" />
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button size="lg" onClick={handleStartTest}>
          I Agree & Start Test
        </Button>
      </div>
    </div>
  );
}

/* ======================================================
   SMALL COMPONENTS
====================================================== */

function Instruction({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4 p-5">
      <div className="text-indigo-600 mt-0.5">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{text}</div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}
