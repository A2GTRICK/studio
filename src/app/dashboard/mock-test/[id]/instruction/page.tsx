
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
  Sparkles,
  IndianRupee,
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
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthSession();

  const [test, setTest] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id || authLoading) return;

    async function load() {
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
      } catch (e) {
        console.error("Failed to load instruction data", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, user, authLoading]);

  /* ---------------- START & PURCHASE LOGIC ---------------- */

  const handleSinglePurchase = async () => {
    const price = test?.price;

    if (!id || !price || !user) {
      toast({
        variant: "destructive",
        title: "Purchase Error",
        description: "Missing product information or user session.",
      });
      return;
    }
    if (!user.emailVerified) {
      toast({
        variant: "destructive",
        title: "Email not verified",
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
          amount: price,
          plan: `single_test`,
          contentId: id,
        }),
      });

      if (!orderRes.ok) throw new Error("Failed to create Razorpay order.");
      const order = await orderRes.json();

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "pharmA2G",
        description: `Single Test Purchase: ${test.title}`,
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.uid,
              plan: `single_test`,
              amount: order.amount,
              contentId: id,
            }),
          });

          const result = await verifyRes.json();

          if (result.success) {
            toast({
              title: "Purchase Successful!",
              description: "You now have access. Refreshing...",
            });
            window.location.reload();
          } else {
            throw new Error(result.error || "Payment verification failed.");
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: { color: "#6D28D9" },
      });

      razorpay.open();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Payment Unsuccessful",
        description: err.message || "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  function handleStartTest() {
    if (!user) {
      alert("You must be logged in to start the test.");
      router.push(`/auth/login?redirect=/dashboard/mock-test/${id}/instruction`);
      return;
    }

    if (!canAccess) {
      alert("You do not have access to this premium test.");
      return;
    }

    sessionStorage.setItem(`mocktest_${id}_accepted`, "true");
    router.push(`/dashboard/mock-test/${id}`);
  }

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!test) {
    return <div className="p-10 text-center">Test not found.</div>;
  }

  /* ---------------- ACCESS LOGIC ---------------- */
  const isPremiumTest = test.isPremium === true;
  const hasGrant = userData?.grantedTestIds?.includes(id);
  const isPro = hasActivePremium(userData);
  const canAccess = !isPremiumTest || isPro || hasGrant;

  /* ---------------- PREMIUM LOCK UI ---------------- */
  if (!canAccess) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white border rounded-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
            <Crown className="text-purple-600 w-7 h-7" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Premium Mock Test</h1>
        <p className="text-muted-foreground">
          This mock test is part of our premium CBT practice set.
        </p>
        <div className="bg-muted rounded-xl p-4 text-sm text-left space-y-1">
          <p>✔ Exam-level questions</p>
          <p>✔ CBT timer & navigation</p>
          <p>✔ Accurate performance analysis</p>
        </div>

        <div className="pt-2 space-y-4">
          {test.price > 0 && (
            <Button
              onClick={handleSinglePurchase}
              disabled={isProcessing}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Buy Just This Test for <IndianRupee className="inline-block h-5 w-5 mx-1" /> {test.price}
                </>
              )}
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">OR</span>
            </div>
          </div>
          
          <Button onClick={() => router.push("/dashboard/billing")} size="lg" className="w-full">
            Continue with Pro
          </Button>
        </div>

        <button
          onClick={() => router.push("/dashboard/mock-test")}
          className="text-xs text-muted-foreground underline pt-2"
        >
          Explore free mock tests
        </button>
      </div>
    );
  }

  /* ---------------- INSTRUCTIONS UI ---------------- */
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">{test.title}</h1>
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <Instruction icon={<Clock />} title="Test Duration" text={`Time limit: ${test.duration || 60} minutes`} />
        <Instruction icon={<BookOpen />} title="Question Pattern" text={`${test.questionCount || "Multiple"} questions • Negative marking may apply`} />
        <Instruction icon={<Monitor />} title="Navigation Rules" text="You can move between questions. Answers can be changed." />
        <Instruction icon={<AlertTriangle />} title="Auto Submission" text="Test auto-submits when time ends." />
      </div>
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button size="lg" onClick={handleStartTest}>I Agree & Start Test</Button>
      </div>
    </div>
  );
}

/* ---------------- COMPONENT ---------------- */
function Instruction({ icon, title, text }: { icon: React.ReactNode; title: string; text: string; }) {
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
