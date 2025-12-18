
"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { db } from "@/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const plans = [
  {
    id: "free",
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
    cta: "Your Current Plan",
  },
  {
    id: "pro",
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
    cta: "Upgrade to Pro",
  },
];

export default function BillingPage() {
  const authSession = useAuthSession();
  const user = authSession?.user;
  const { toast } = useToast();

  const [userPlan, setUserPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoadingPlan(false);
      return;
    }

    async function checkUserPlan() {
      setLoadingPlan(true);
      try {
        const profileRef = doc(db, "user_profiles", user!.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setUserPlan(data.plan || "free");
        }

        const requestRef = doc(db, "upgrade_requests", user!.uid);
        const requestSnap = await getDoc(requestRef);
        if (requestSnap.exists() && requestSnap.data().status === "pending") {
          setPendingRequest(true);
        }
      } catch (error) {
        console.error("Error fetching user plan:", error);
      } finally {
        setLoadingPlan(false);
      }
    }

    checkUserPlan();
  }, [user]);

  const handleUpgradeClick = () => {
    if (pendingRequest) {
      toast({
        title: "Request Pending",
        description: "Your previous upgrade request is still being reviewed by the admin.",
      });
      return;
    }
    setIsModalOpen(true);
  };
  
  const handleSubmitRequest = async () => {
    if (!user) return;
    if (!transactionId.trim()) {
        toast({
            variant: 'destructive',
            title: 'Transaction ID Required',
            description: 'Please enter the transaction ID to submit your request.',
        });
        return;
    }

    setIsSubmitting(true);
    try {
        const requestRef = doc(db, "upgrade_requests", user.uid);
        await setDoc(requestRef, {
            userId: user.uid,
            userEmail: user.email,
            requestedPlan: 'pro',
            transactionId: transactionId.trim(),
            status: 'pending',
            createdAt: serverTimestamp(),
        });
        
        toast({
            title: 'Request Submitted!',
            description: 'Your upgrade request has been sent for admin verification. This may take some time.',
        });
        setPendingRequest(true);
        setIsModalOpen(false);
        setTransactionId("");

    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'Could not submit your request. Please try again.',
        });
        console.error("Error submitting upgrade request:", error);
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Billing & Plans
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription and view payment history.
          </p>
        </div>

        {loadingPlan ? (
           <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => {
              const isCurrentUserPlan = plan.id === userPlan;
              return (
                <Card
                  key={plan.name}
                  className={`flex flex-col shadow-md ${
                    isCurrentUserPlan ? "border-2 border-primary" : "border"
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="font-headline text-2xl">
                        {plan.name}
                      </CardTitle>
                      {isCurrentUserPlan && (
                        <Badge
                          variant="default"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {plan.priceDescription}
                      </span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={isCurrentUserPlan || plan.id === 'free'}
                      onClick={plan.id === 'pro' ? handleUpgradeClick : undefined}
                    >
                      {isCurrentUserPlan
                        ? "Your Current Plan"
                        : plan.cta}
                      {!isCurrentUserPlan && plan.id === 'pro' && (
                        <Sparkles className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        
        {pendingRequest && (
             <Card className="shadow-md bg-amber-50 border-amber-300">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2 text-amber-800"><Loader2 className="animate-spin" /> Verification Pending</CardTitle>
                    <CardDescription className="text-amber-700">Your request to upgrade to the Pro plan is currently under review by the admin. Access will be granted upon successful verification.</CardDescription>
                </CardHeader>
            </Card>
        )}

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <CreditCard /> Payment History
            </CardTitle>
            <CardDescription>
              View your past invoices and transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg bg-secondary/30">
              <p>No payment history found.</p>
              <p className="text-sm">
                Your invoices will appear here once you make a purchase.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">Upgrade to Pro</DialogTitle>
            <DialogDescription>
              Scan the QR code to pay ₹100, then enter the Transaction ID to submit your request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
              <div className="p-4 bg-secondary rounded-lg flex justify-center">
                <Image src="https://i.postimg.cc/d1y3Cg2Y/qr-upi.png" alt="UPI QR Code" width={200} height={200} />
              </div>
              <p className="text-center text-sm font-semibold text-muted-foreground">UPI ID: <span className="text-foreground">a2g-payment@upi</span></p>
              <div className="space-y-2">
                  <Label htmlFor="txnId">Transaction ID</Label>
                  <Input 
                    id="txnId" 
                    placeholder="Enter the transaction ID from your UPI app" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
              </div>
          </div>
          <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </Button>
          <p className="text-xs text-center text-muted-foreground pt-2">Note: This is a manual verification process. Your plan will be upgraded once an admin confirms your payment. For issues, check the <Link href="/dashboard/help" className="underline">Help & FAQ</Link> page.</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

