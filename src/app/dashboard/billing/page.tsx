
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Sparkles } from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "₹0",
        priceDescription: "/month",
        description: "For individuals getting started with our core features.",
        features: [
            "Limited AI Note Generations per day",
            "Limited AI Quiz Generations per day",
            "Access to all free notes & MCQs",
            "Basic community support",
        ],
        isCurrent: true,
        cta: "You're on this plan",
    },
    {
        name: "Pro",
        price: "₹100",
        priceDescription: "/month",
        description: "For power users who need unlimited access and premium features.",
        features: [
            "Unlimited AI Note Generations",
            "Unlimited AI Quiz Generations",
            "Access to all premium content",
            "Priority support",
            "Early access to new features",
        ],
        isCurrent: false,
        cta: "Upgrade to Pro",
    }
]

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Billing & Plans
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and view payment history.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map(plan => (
            <Card key={plan.name} className={`flex flex-col shadow-md ${plan.isCurrent ? 'border-2 border-primary' : 'border'}`}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                        {plan.isCurrent && <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">Current Plan</Badge>}
                    </div>
                    <div className="flex items-baseline">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-sm font-normal text-muted-foreground">{plan.priceDescription}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <ul className="space-y-3">
                        {plan.features.map(feature => (
                            <li key={feature} className="flex items-start gap-2">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={plan.isCurrent}>
                        {plan.cta}
                        {!plan.isCurrent && <Sparkles className="ml-2 h-4 w-4" />}
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><CreditCard /> Payment History</CardTitle>
            <CardDescription>View your past invoices and transactions.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-secondary/30">
                <p>No payment history found.</p>
                <p className="text-sm">Your invoices will appear here once you make a purchase.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
