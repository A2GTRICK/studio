
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
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const pricingPlans = [
   {
    id: 'pro_daily',
    name: 'Pro Daily',
    price: 10,
    duration: 1,
    durationLabel: '/ day',
    description: 'Perfect for a single-day study session.',
    features: ['All premium notes', 'Mock tests & analytics', '24-hour access'],
    isPopular: false,
  },
    {
    id: 'pro_weekly',
    name: 'Pro Weekly',
    price: 30,
    duration: 7,
    durationLabel: '/ week',
    description: 'Ideal for a week of focused preparation.',
    features: ['All premium notes', 'Mock tests & analytics', '7-day access'],
    isPopular: false,
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 100,
    duration: 30,
    durationLabel: '/ month',
    description: 'Flexible monthly access. Best for short-term prep.',
    features: ['All premium notes', 'Mock tests & analytics', 'Priority support'],
    isPopular: false,
  },
  {
    id: 'pro_quarterly',
    name: 'Pro Quarterly',
    price: 250,
    duration: 90,
    durationLabel: '/ 3 months',
    description: 'Balanced plan for semester-long preparation.',
    features: ['All premium notes', 'Mock tests & analytics', 'Priority support', 'Saves 17%'],
    isPopular: true,
  },
  {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: 999,
    duration: 365,
    durationLabel: '/ year',
    description: 'Best value for long-term, comprehensive exam prep.',
    features: ['All premium notes', 'Mock tests & analytics', 'Priority support', 'Saves ~20%'],
    isPopular: false,
  },
];

type Plan = typeof pricingPlans[0];

export default function BillingPage() {
  const authSession = useAuthSession();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const user = authSession?.user;
  const isPro = authSession?.user && (authSession.user as any)?.plan === "pro";
  const isEmailVerified = user?.emailVerified === true;

  const startPayment = async (plan: Plan) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to make a payment.",
      });
      return;
    }
    if (!isEmailVerified) {
      toast({
        variant: "destructive",
        title: "Email not verified",
        description: "Please verify your email before making a payment.",
      });
      return;
    }

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        body: JSON.stringify({
          amount: plan.price,
          plan: plan.id,
          contentId: null, // This is a subscription, not a single purchase
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
        description: `${plan.name} Subscription`,
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
                plan: plan.id,
                amount: order.amount,
                contentId: null,
              }),
            }
          );

          const result = await verifyRes.json();

          if (result.success) {
            toast({
              title: "Pro access activated!",
              description: `You now have uninterrupted access for ${plan.name}.`,
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
    } finally {
        setSelectedPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      <div>
        <h1 className="text-3xl font-bold">Billing & Access</h1>
        <p className="text-muted-foreground max-w-xl">
          Choose the level of access that fits your current stage of preparation.
        </p>
      </div>
      
      {!isEmailVerified && user && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5"/>
              <div>
                  <h3 className="font-semibold text-amber-900">Email Verification Required</h3>
                  <p className="text-sm text-amber-800 mt-1">Please verify your email address before purchasing a plan. You can find the verification link in your inbox or resend it from your <Link href="/dashboard/settings" className="underline font-medium">settings page</Link>.</p>
              </div>
          </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {pricingPlans.map((plan) => (
            <Card key={plan.id} className={cn(
                "relative flex flex-col",
                plan.isPopular ? "border-2 border-primary shadow-lg" : "",
                isPro ? "opacity-70" : ""
            )}>
                {plan.isPopular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="text-4xl font-bold flex items-center">
                    <IndianRupee className="w-6 h-6" /> {plan.price}
                    <span className="text-sm ml-1 text-muted-foreground">
                        {plan.durationLabel}
                    </span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm">
                    {plan.features.map(feature => (
                        <li key={feature} className="flex gap-2">
                            <Check className="text-green-500 w-4 h-4 mt-0.5" /> {feature}
                        </li>
                    ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        disabled={!!isPro || !isEmailVerified}
                        onClick={() => setSelectedPlan(plan)}
                    >
                    {isPro ? "You’re already Pro" : "Choose Plan"}
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>

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
      
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-2xl font-bold">
              Confirm: {selectedPlan.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              You are about to purchase the {selectedPlan.name} plan, which gives you Pro access for {selectedPlan.duration} {selectedPlan.duration > 1 ? 'days' : 'day'}.
            </p>
            <div className="border rounded-lg p-4 flex justify-between items-center">
              <span className="font-medium">Amount payable</span>
              <span className="text-xl font-bold flex items-center">
                <IndianRupee className="w-4 h-4" /> {selectedPlan.price}
              </span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Payments are securely processed by Razorpay. We do not store your card or UPI details.</span>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedPlan(null)}
              >
                Go back
              </Button>
              <Button onClick={() => startPayment(selectedPlan)}>
                Proceed to secure payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
