"use client";

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
import { Check, CreditCard, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const authSession = useAuthSession();
  const user = authSession?.user;
  const { toast } = useToast();

  const isPro = (user as any)?.plan === "pro";

  const startPayment = async () => {
    if (!user) return;

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100, plan: "pro" }), // Assuming amount is fixed for now
      });

      const order = await orderRes.json();
      if (!order || !order.id) {
        throw new Error("Order creation failed");
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
                amount: order.amount / 100, // Convert paise back to rupees for db
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
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: { color: "#6D28D9" },
      });

      razorpay.open();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment history.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FREE PLAN */}
        <Card className="shadow-md border">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Basic access</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-4">₹0</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <Check className="text-green-500" /> Free notes & MCQs
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button disabled={!isPro} className="w-full">
              {!isPro ? "Current Plan" : "Downgrade"}
            </Button>
          </CardFooter>
        </Card>

        {/* PRO PLAN */}
        <Card
          className={`shadow-md ${
            isPro ? "border-2 border-primary" : ""
          }`}
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Pro</CardTitle>
              {isPro && <Badge>Current</Badge>}
            </div>
            <CardDescription>₹100 / month</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-3xl font-bold mb-4">₹100</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <Check className="text-green-500" /> Unlimited premium content
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
              onClick={startPayment}
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
    </div>
  );
}
