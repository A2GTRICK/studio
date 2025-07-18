
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const freePlanFeatures = [
    "Access to free library notes",
    "Limited AI tool usage",
    "Standard support",
    "No follow-up questions",
    "No competitive exam focus"
];

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
    badge: "Best Value"
  },
];

export default function PremiumPage() {

  const createMailToLink = (planName: string, price: string) => {
    const subject = `Inquiry for ${planName} Plan`;
    const body = `Hello, I am interested in purchasing the ${planName} plan for ${price}. Please provide me with the payment details.`;
    // You can replace this email with your actual business email address.
    const email = "sales@a2gsmartnotes.com";
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-headline font-bold">Unlock Your Potential</h1>
        <p className="text-muted-foreground mt-2 text-lg">Choose a plan that fits your study habits and get access to all our premium features to excel in your exams.</p>
        <Badge variant="destructive" className="mt-4 text-base">Limited Time Offer: 20% OFF on Yearly Plan!</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
        <Card className="flex flex-col">
           <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">Free Plan</CardTitle>
              <div>
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-muted-foreground">/ forever</span>
              </div>
              <CardDescription>Get a taste of our platform with basic features.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {freePlanFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    { i < 3 ? <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" /> : <X className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" />}
                    <span className={ i >=3 ? "text-muted-foreground line-through" : ""}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="outline" disabled>Your Current Plan</Button>
            </CardFooter>
        </Card>
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col transition-transform hover:scale-105 ${plan.popular ? 'border-primary border-2 shadow-lg' : ''}`}>
            {(plan.popular || plan.badge) && 
                <div className={`text-center py-1.5 px-3 text-sm font-semibold rounded-t-lg -mt-px mx-[-1px] ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                    {plan.popular ? 'Most Popular' : plan.badge}
                </div>
            }
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
              <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                <a href={createMailToLink(plan.name, plan.price)}>Choose Plan</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
