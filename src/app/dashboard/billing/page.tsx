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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const { user } = useAuthSession();
  const { toast } = useToast();

  const [showPreview, setShowPreview] = useState(false);
  const isPro = (user as any)?.plan === "pro";

  /* ===============================
     RAZORPAY PAYMENT START
  =============================== */

  const startPayment = async () => {
    setShowPreview(false);

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
      });

      const order = await orderRes.json();

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
              }),
            }
          );

          const result = await verifyRes.json();

          if (result.success) {
            toast({
              title: "Payment successful 🎉",
              description: "Pro plan activated successfully.",
            });
            window.location.reload();
          } else {
            throw new Error("Verification failed");
          }
        },
        theme: { color: "#6D28D9" },
      });

      razorpay.open();
    } catch {
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment history.
        </p>
      </div>

      {/* PLANS */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* FREE */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Basic access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold flex items-center">
              <IndianRupee className="w-6 h-6" /> 0
            </div>
            <ul className="mt-4 space-y-2">
              <li className="flex gap-2">
                <Check className="text-green-500" /> Free notes & MCQs
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button disabled className="w-full">
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* PRO */}
        <Card className={isPro ? "border-2 border-primary" : ""}>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>Pro</CardTitle>
              {isPro && <Badge>Current</Badge>}
            </div>
            <CardDescription>Monthly subscription</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-4xl font-bold flex items-center">
              <IndianRupee className="w-6 h-6" /> 100
              <span className="text-sm ml-1 text-muted-foreground">
                / month
              </span>
            </div>

            <ul className="mt-4 space-y-2">
              <li className="flex gap-2">
                <Check className="text-green-500" /> Unlimited premium notes
              </li>
              <li className="flex gap-2">
                <Check className="text-green-500" /> Mock tests & analytics
              </li>
              <li className="flex gap-2">
                <Check className="text-green-500" /> Priority support
              </li>
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              className="w-full"
              disabled={isPro}
              onClick={() => setShowPreview(true)}
            >
              {isPro ? "You're Pro 🎉" : "Upgrade to Pro"}
              {!isPro && <Sparkles className="ml-2 h-4 w-4" />}
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
          Coming soon.
        </CardContent>
      </Card>

      {/* ==========================
         PREVIEW / TRUST MODAL
      ========================== */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-5">

            <h2 className="text-2xl font-bold">
              Confirm your Pro Plan
            </h2>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✔ Access to all premium notes & mock tests</p>
              <p>✔ Progress tracking & analytics</p>
              <p>✔ Cancel anytime</p>
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
              We never store your card or UPI details.
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Cancel
              </Button>
              <Button onClick={startPayment}>
                Proceed to Secure Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
