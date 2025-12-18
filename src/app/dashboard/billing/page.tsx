"use client";

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
import { useAuthSession } from "@/auth/AuthSessionProvider";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PRO_PRICE = 100;

export default function BillingPage() {
  const authSession = useAuthSession();
  const user = authSession?.user;

  const handleUpgrade = async () => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      // 1️⃣ Create order (server)
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: PRO_PRICE,
          plan: "pro",
        }),
      });

      const order = await res.json();

      if (!order.id) {
        throw new Error("Order creation failed");
      }

      // 2️⃣ Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "pharmA2G",
        description: "Pro Plan Subscription",
        order_id: order.id,
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#6D28D9",
        },
        handler: function (response: any) {
          console.log("Payment success:", response);

          alert(
            "Payment successful! Verification will be completed shortly."
          );

          // 🔒 DO NOT upgrade plan here
          // This will be done after verification (STEP 4)
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      alert("Unable to initiate payment. Try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Upgrade to unlock premium features.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FREE */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <Badge>Current Plan</Badge>
            <p className="text-3xl font-bold">₹0</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <Check className="text-green-500" /> Free notes & MCQs
              </li>
              <li className="flex gap-2">
                <Check className="text-green-500" /> Basic progress tracking
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button disabled className="w-full">
              You’re on this plan
            </Button>
          </CardFooter>
        </Card>

        {/* PRO */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <p className="text-3xl font-bold">₹100 / month</p>
            <CardDescription>
              Unlock premium content & analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <Check className="text-green-500" /> Premium notes
              </li>
              <li className="flex gap-2">
                <Check className="text-green-500" /> Mock tests
              </li>
              <li className="flex gap-2">
                <Check className="text-green-500" /> Advanced analytics
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleUpgrade}>
              Upgrade to Pro <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard /> Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          No payments yet.
        </CardContent>
      </Card>
    </div>
  );
}
