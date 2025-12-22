
"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, BookOpen, Sparkles, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/auth/AuthSessionProvider";
import { useToast } from "@/hooks/use-toast";

type PremiumGuardProps = {
  isPremium: boolean;
  canAccess: boolean;
  contentType?: "note" | "test" | "mcq";
  contentId?: string; // The ID of the specific item (e.g., note ID)
  price?: number; // The price of the single item
  children: ReactNode;
};

// Make Razorpay available on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PremiumGuard({
  isPremium,
  canAccess,
  contentType = "content",
  contentId,
  price,
  children,
}: PremiumGuardProps) {
  const router = useRouter();
  const { user } = useAuthSession();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Single Purchase Payment Flow ---
  const handleSinglePurchase = async () => {
    if (!contentId || !price || !user) {
      toast({
        variant: "destructive",
        title: "Purchase Error",
        description: "Missing product information or user session.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create a Razorpay order for this specific item
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          plan: `single_${contentType}`, // e.g., 'single_note'
          contentId: contentId, // Pass contentId to order notes
        }),
      });

      if (!orderRes.ok) throw new Error("Failed to create order.");
      const order = await orderRes.json();

      // 2. Open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "pharmA2G",
        description: `Purchase single ${contentType}`,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment on the backend
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.uid,
              plan: `single_${contentType}`,
              amount: order.amount,
              contentId: contentId, // IMPORTANT: Tell backend which content was purchased
            }),
          });

          const result = await verifyRes.json();

          if (result.success) {
            toast({
              title: "Purchase Successful!",
              description: `You now have access to this ${contentType}.`,
            });
            window.location.reload(); // Reload to reflect new access rights
          } else {
            throw new Error(result.error || "Payment verification failed.");
          }
        },
        theme: { color: "#6D28D9" },
      });

      razorpay.open();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Payment Unsuccessful",
        description: err.message || "Please try again. No amount was deducted.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Allow access
  if (!isPremium || canAccess) {
    return <>{children}</>;
  }

  // 🔒 Show Paywall
  return (
    <div className="mt-14">
      <div className="max-w-2xl mx-auto rounded-3xl border border-dashed bg-white px-10 py-12 shadow-sm text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
            <Lock className="h-7 w-7 text-purple-700" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">
          Unlock This Premium {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
        </h2>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
          This {contentType} is part of our structured study material.
          Unlock it individually or get Pro access for our entire library.
        </p>

        {/* CTA Buttons */}
        <div className="pt-2 space-y-4">
          {/* Single Purchase Button */}
          {contentId && price && (
            <Button
              onClick={handleSinglePurchase}
              disabled={isProcessing}
              size="lg"
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Buy Just This {contentType} for <IndianRupee className="inline-block h-5 w-5 mx-1" /> {price}
                </>
              )}
            </Button>
          )}

          {/* OR Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Pro Access Button */}
          <Button
            onClick={() => router.push("/dashboard/billing")}
            size="lg"
            variant="outline"
            className="w-full"
            disabled={isProcessing}
          >
            Get Full Pro Access
          </Button>

          <div className="mt-3">
            <button
              onClick={() => router.back()}
              className="text-sm text-purple-600 hover:underline"
            >
              Explore free content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
