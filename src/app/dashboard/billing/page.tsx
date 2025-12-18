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
import {
  Check,
  CreditCard,
  Sparkles,
  Lock,
} from "lucide-react";
import { useAuthSession } from "@/auth/AuthSessionProvider";

/* =========================================================
   PLAN CONFIG
   (NO PAYMENT GATEWAY YET — SAFE)
========================================================= */

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "/month",
    description:
      "Best for students getting started with notes and practice.",
    features: [
      "Access to all free notes & MCQs",
      "Basic dashboard & progress tracking",
      "Community access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹100",
    period: "/month",
    description:
      "For serious aspirants who want full access and premium tools.",
    features: [
      "All Free plan features",
      "Premium notes & mock tests",
      "Advanced performance analytics",
      "Priority support",
      "Early access to new features",
    ],
  },
];

/* =========================================================
   BILLING PAGE
========================================================= */

export default function BillingPage() {
  const authSession = useAuthSession();

  // ⚠️ TEMP LOGIC
  // Later this will come from Firestore (user.plan)
  const currentPlanId = "free";

  return (
    <div className="max-w-5xl mx-auto space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your plan and view billing details.
        </p>
      </div>

      {/* PLANS */}
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col shadow-md ${
                isCurrent
                  ? "border-2 border-primary"
                  : "border"
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">
                    {plan.name}
                  </CardTitle>
                  {isCurrent && (
                    <Badge className="bg-primary/10 text-primary">
                      Current Plan
                    </Badge>
                  )}
                </div>

                <div className="flex items-baseline mt-2">
                  <span className="text-4xl font-bold">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>

                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2"
                    >
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                      <span className="text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  <Button
                    className="w-full"
                    disabled
                    variant="secondary"
                  >
                    You’re on this plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() =>
                      alert(
                        "Payments coming soon. Stay tuned!"
                      )
                    }
                  >
                    Upgrade to Pro
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* PAYMENT HISTORY */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            Your invoices and transactions will appear here.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg bg-secondary/30 text-muted-foreground">
            <Lock className="w-6 h-6" />
            <p>No payments yet</p>
            <p className="text-sm text-center">
              Once you upgrade to Pro, your billing history
              will be visible here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}