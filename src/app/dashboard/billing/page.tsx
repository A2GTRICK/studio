"use client";

import { useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CreditCard,
  Sparkles,
  ShieldCheck,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const session = useAuthSession();
  const user = session?.user;
  const { toast } = useToast();

  const [showPreview, setShowPreview] = useState(false);
  
  // Safely access user properties
  const isPro = !!user && (user as any)?.plan === "pro";
  const isEmailVerified = !!user && user.emailVerified === true;


  /* ===============================
     RAZORPAY PAYMENT START
  =============================== */

  const startPayment = async () => {
    setShowPreview(false);

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to make a payment.",
      });
      return;
    }

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        body: JSON.stringify({
          amount: 100,
          plan: 'pro'
        })
      });

      const order = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(order.error || 'Failed to create Razorpay order.');
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "pharmA2G",
        description: "Pro Plan Subscription",
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch(
            "/api/razorpay/verify-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.uid,
                plan: "pro",
                amount: order.amount,
                contentId: null, // Pro plan doesn't have a specific contentId
              }),
            }
          );

          const result = await verifyRes.json();

          if (result.success) {
            toast({
              title: "Pro access activated",
              description:
                "You now have uninterrupted access to structured study material.",
            });
            window.location.reload();
          } else {
            throw new Error(result.error || "Payment verification failed");
          }
        },
        prefill: {
            name: user.displayName || "",
            email: user.email || "",
        },
        theme: { color: "#6D28D9" },
      });

      razorpay.open();
    } catch(err: any) {
      toast({
        variant: "destructive",
        title: "Payment unsuccessful",
        description: err.message || "Please try again. No amount was deducted.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Access</h1>
        <p className="text-muted-foreground max-w-xl">
          Choose the level of access that fits your current stage of
          preparation. You can upgrade anytime.
        </p>
      </div>
      
      {/* EMAIL VERIFICATION BANNER */}
      {user && !isEmailVerified && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5"/>
              <div>
                  <h3 className="font-semibold text-amber-900">Email Verification Required</h3>
                  <p className="text-sm text-amber-800 mt-1">Please verify your email address before proceeding with a payment. You can find the verification link in your inbox or resend it from your <Link href="/dashboard/settings" className="underline font-medium">settings page</Link>.</p>
              </div>
          </div>
      )}


      {/* PLANS */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* FREE */}
        <Card className="relative">
          <CardHeader>
            <CardTitle>Free Access</CardTitle>
            <CardDescription>
              Suitable for casual browsing and limited practice
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-bold flex items-center">
              <IndianRupee className="w-6 h-6" /> 0
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2">
                <Check className="text-green-500" /> Selected notes
              </li>
              <li className="flex gap-2">
                <Check className="text-green-500" /> Free MCQ practice
              </li>
            </ul>

            <p className="mt-4 text-xs text-muted-foreground">
              Ideal if you are exploring topics or just getting started.
            </p>
          </CardContent>

          <CardFooter>
            <Button disabled className="w-full">
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* PRO */}
        <Card className={`relative ${isPro ? "border-2 border-primary" : ""}`}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pro Access</CardTitle>
              {isPro && <Badge>Active</Badge>}
            </div>
            <CardDescription>
              Structured, exam-oriented preparation
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-bold flex items-center">
              <IndianRupee className="w-6 h-6" /> 100
              <span className="text-sm ml-1 text-muted-foreground">
                / month
              </span>
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex gap-2">
                <Check className="text-green-500" /> All premium notes
              </li>
              <li className="flex gap-2">
                <Check className="text-green-500" /> Mock tests & analytics
              </li>
              <li className="flex gap-2">
                <Check className="text-green-500" /> Priority support
              </li>
            </ul>

            <p className="mt-4 text-xs text-muted-foreground">
              Recommended if you are preparing seriously and want continuity
              across subjects.
            </p>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              disabled={isPro || !isEmailVerified}
              onClick={() => setShowPreview(true)}
            >
              {isPro ? "You’re already Pro" : !isEmailVerified ? "Verify Email to Upgrade" : "Continue with Pro"}
              {!isPro && isEmailVerified && <Sparkles className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* PAYMENT HISTORY */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard /> Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          Your past transactions will appear here.
        </CardContent>
      </Card>

      {/* ==========================
         CONFIRMATION MODAL
      ========================== */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-5">

            <h2 className="text-2xl font-bold">
              Confirm Pro Access
            </h2>

            <p className="text-sm text-muted-foreground">
              This gives you uninterrupted access to structured study material
              across notes, mock tests, and practice.
            </p>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✔ Syllabus-aligned premium content</p>
              <p>✔ Cancel anytime</p>
              <p>✔ No hidden charges</p>
            </div>

            <div className="border rounded-lg p-4 flex justify-between items-center">
              <span className="font-medium">Amount payable</span>
              <span className="text-xl font-bold flex items-center">
                <IndianRupee className="w-4 h-4" /> 100
              </span>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mt-0.5" />
              Payments are securely processed by Razorpay.
              We do not store your card or UPI details.
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Go back
              </Button>
              <Button onClick={startPayment}>
                Proceed to secure payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
