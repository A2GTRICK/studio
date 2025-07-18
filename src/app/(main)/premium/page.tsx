import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Weekly",
    price: "₹99",
    period: "/ week",
    description: "Perfect for a quick boost for your upcoming exams.",
    features: ["Unlock All Premium Notes", "AI Note Generation", "AI Exam Questions", "Email Support"],
    popular: false,
  },
  {
    name: "Monthly",
    price: "₹299",
    period: "/ month",
    description: "Our most popular plan for semester-long learning.",
    features: ["Unlock All Premium Notes", "AI Note Generation", "AI Exam Questions", "Priority Email Support", "Ask Follow-up Questions to AI"],
    popular: true,
  },
  {
    name: "Yearly",
    price: "₹1,499",
    period: "/ year",
    description: "Best value for dedicated, year-round study.",
    features: ["Unlock All Premium Notes", "AI Note Generation", "AI Exam Questions", "Priority Email Support", "Ask Follow-up Questions to AI", "Early Access to New Notes"],
    popular: false,
  },
];

export default function PremiumPage() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-headline font-bold">Unlock Your Potential</h1>
        <p className="text-muted-foreground mt-2">Choose a plan that fits your study habits and get access to all our premium features to excel in your exams.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col transition-transform hover:scale-105 ${plan.popular ? 'border-primary border-2 shadow-lg scale-105' : ''}`}>
            {plan.popular && <div className="bg-primary text-primary-foreground text-center py-1.5 px-3 text-sm font-semibold rounded-t-lg -mt-px mx-[-1px]">Most Popular</div>}
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
              <div>
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>Choose Plan</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
