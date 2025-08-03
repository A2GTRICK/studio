
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Sparkles } from "lucide-react";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "For individuals getting started.",
        features: [
            "20 Note Generations per day",
            "20 Quiz Generations per day",
            "Basic support",
        ],
        isCurrent: true,
    },
    {
        name: "Pro",
        price: "$10",
        description: "For power users who need more.",
        features: [
            "Unlimited Note Generations",
            "Unlimited Quiz Generations",
            "Priority support",
            "Access to premium features",
        ],
        isCurrent: false,
    }
]

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
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
            <Card key={plan.name} className={`flex flex-col shadow-md ${plan.isCurrent ? 'border-primary' : ''}`}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                        {plan.isCurrent && <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">Current Plan</Badge>}
                    </div>
                    <p className="text-4xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <ul className="space-y-3">
                        {plan.features.map(feature => (
                            <li key={feature} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" disabled={plan.isCurrent}>
                        {plan.isCurrent ? "You're on this plan" : "Upgrade Plan"}
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
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>No payment history found.</p>
                <p className="text-sm">Your invoices will appear here once you make a purchase.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
